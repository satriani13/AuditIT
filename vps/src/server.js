import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import {randomUUID,randomBytes,createHash,scryptSync,timingSafeEqual} from 'node:crypto';
import {mkdirSync,existsSync} from 'node:fs';
import {unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {openDatabase,unpack} from './database.js';
import {areas,templates} from './templates.js';
import {makeReport} from './report.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=s=>createHash('sha256').update(s).digest('hex');
const now=()=>new Date().toISOString();
const areaIds=areas.map(a=>a.id);
function fail(status,message){const e=new Error(message);e.status=status;throw e;}
function text(v,max=20000){if(v==null)return '';if(typeof v!=='string'||v.length>max)fail(400,'Invalid or overly long text.');return v.trim();}
function choice(v,values){if(!values.includes(v))fail(400,'Invalid selection.');return v;}
function date(v){v=text(v,10);if(v&&!/^\d{4}-\d{2}-\d{2}$/.test(v))fail(400,'Invalid date.');return v;}
function updateJson(db,table,id,body,data){const result=db.prepare(`UPDATE ${table} SET data=?,version=version+1${table==='audits'?',updated_at=?':''} WHERE id=? AND version=?`).run(...(table==='audits'?[JSON.stringify(data),now(),id,body.version]:[JSON.stringify(data),id,body.version]));if(!result.changes)fail(409,'This record changed in another window. Reload it before saving.');return {...data,version:body.version+1};}
export function createApp(options={}){
 const directory=path.resolve(options.directory||process.env.DATA_DIR||path.join(root,'data'));
 const uploads=path.join(directory,'uploads');mkdirSync(uploads,{recursive:true});
 const db=openDatabase(directory);const app=express();app.disable('x-powered-by');
 const password=options.password??process.env.APP_PASSWORD??'';
 const publicUrl=options.publicUrl||process.env.PUBLIC_URL||'';
 const salt=randomBytes(16);const secret=password?scryptSync(password,salt,64):null;
 const attempts=new Map();const secure=publicUrl.startsWith('https://');
 app.use((req,res,next)=>{res.set({'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; img-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"});if(req.path.startsWith('/api/'))res.set('Cache-Control','no-store');next();});
 app.use(express.json({limit:'1mb'}));
 app.use('/api',(req,res,next)=>{if(!['GET','HEAD'].includes(req.method)&&req.get('X-Fieldbook')!=='1')return res.status(403).json({error:'Invalid request. Refresh this page.'});next();});
 function authorised(req){if(!password)return true;const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('fieldbook_session='))?.slice(18);return !!(token&&db.prepare('SELECT 1 FROM sessions WHERE token_hash=? AND expires>?').get(hash(token),Date.now()));}
 app.get('/api/session',(req,res)=>res.json({authenticated:authorised(req),localOnly:!password}));
 app.post('/api/login',(req,res)=>{if(!password)return res.json({ok:true});const key=req.socket.remoteAddress;const a=attempts.get(key)||{count:0,until:Date.now()+60000};if(a.until<Date.now()){a.count=0;a.until=Date.now()+60000}if(a.count>=10)return res.status(429).json({error:'Too many attempts. Try again in one minute.'});a.count++;attempts.set(key,a);const candidate=scryptSync(String(req.body.password||'').slice(0,1024),salt,64);if(!timingSafeEqual(candidate,secret))return res.status(401).json({error:'Incorrect password.'});attempts.delete(key);db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?)').run(hash(token),Date.now()+12*60*60*1000);res.cookie('fieldbook_session',token,{httpOnly:true,sameSite:'strict',secure,path:'/',maxAge:12*60*60*1000});res.json({ok:true});});
 app.use('/api',(req,res,next)=>authorised(req)?next():res.status(401).json({error:'Your session expired. Sign in again; your draft is kept.'}));
 app.post('/api/logout',(req,res)=>{const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('fieldbook_session='))?.slice(18);if(token)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token));res.clearCookie('fieldbook_session',{path:'/'}).json({ok:true});});
 app.get('/api/templates',(req,res)=>res.json(areas));
 app.get('/api/audits',(req,res)=>res.json(db.prepare('SELECT * FROM audits ORDER BY updated_at DESC').all().map(unpack)));
 function audit(id){const a=unpack(db.prepare('SELECT * FROM audits WHERE id=?').get(id));if(!a)fail(404,'Audit not found.');return a;}
 function auditData(b,id){const name=text(b.name,300),location=text(b.location,500);if(!name||!location)fail(400,'Site name and location are required.');return {id,name,location,type:choice(b.type,['Factory','Office','Warehouse','Other']),auditor:text(b.auditor,300),date:date(b.date),status:choice(b.status,['In progress','Completed','On hold']),summary:text(b.summary),updatedAt:now()};}
 function detail(id){const a=audit(id);return {...a,findings:db.prepare('SELECT * FROM findings WHERE audit_id=? ORDER BY rowid').all(id).map(unpack),checks:db.prepare('SELECT * FROM checks WHERE audit_id=? ORDER BY rowid').all(id).map(unpack),files:db.prepare('SELECT * FROM evidence WHERE audit_id=? ORDER BY created_at').all(id)};}
 app.post('/api/audits',(req,res)=>{const id=randomUUID(),a=auditData(req.body,id);db.exec('BEGIN');try{db.prepare('INSERT INTO audits(id,data,updated_at) VALUES(?,?,?)').run(id,JSON.stringify(a),now());const insert=db.prepare('INSERT INTO checks(audit_id,template_id,data) VALUES(?,?,?)');for(const t of templates)insert.run(id,t.id,JSON.stringify({...t,status:'Not reviewed',notes:'',updatedAt:null}));db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}res.status(201).json({...a,version:1});});
 app.get('/api/audits/:id',(req,res)=>res.json(detail(req.params.id)));
 app.patch('/api/audits/:id',(req,res)=>{audit(req.params.id);res.json(updateJson(db,'audits',req.params.id,req.body,auditData(req.body,req.params.id)));});
 app.patch('/api/audits/:id/checks/:check',(req,res)=>{audit(req.params.id);const c=unpack(db.prepare('SELECT * FROM checks WHERE audit_id=? AND template_id=?').get(req.params.id,req.params.check));if(!c)fail(404,'Check not found.');const data={...c,status:choice(req.body.status,['Not reviewed','Pass','Issue','Not applicable']),notes:text(req.body.notes),updatedAt:now()};delete data.version;const result=db.prepare('UPDATE checks SET data=?,version=version+1 WHERE audit_id=? AND template_id=? AND version=?').run(JSON.stringify(data),req.params.id,c.id,req.body.version);if(!result.changes)fail(409,'This check was changed elsewhere. Reload before saving.');res.json({...data,version:req.body.version+1});});
 function findingData(b,id,auditId){const title=text(b.title,500),notes=text(b.notes);if(!title||!notes)fail(400,'Finding title and observations are required.');if(b.templateId&&!templates.some(t=>t.id===b.templateId))fail(400,'Unknown checklist item.');return {id,auditId,title,notes,area:choice(b.area,areaIds),severity:choice(b.severity,['Critical','High','Medium','Low','Informational']),status:choice(b.status,['Open','In progress','Resolved','Accepted']),recommendation:text(b.recommendation),owner:text(b.owner,300),due:date(b.due),templateId:b.templateId||'',updatedAt:now()};}
 app.post('/api/audits/:id/findings',(req,res)=>{audit(req.params.id);const id=randomUUID(),f=findingData(req.body,id,req.params.id);db.prepare('INSERT INTO findings(id,audit_id,data) VALUES(?,?,?)').run(id,req.params.id,JSON.stringify(f));res.status(201).json({...f,version:1});});
 app.patch('/api/audits/:id/findings/:finding',(req,res)=>{audit(req.params.id);if(!db.prepare('SELECT id FROM findings WHERE id=? AND audit_id=?').get(req.params.finding,req.params.id))fail(404,'Finding not found.');res.json(updateJson(db,'findings',req.params.finding,req.body,findingData(req.body,req.params.finding,req.params.id)));});
 app.delete('/api/audits/:id/findings/:finding',(req,res)=>{audit(req.params.id);const result=db.prepare('DELETE FROM findings WHERE id=? AND audit_id=?').run(req.params.finding,req.params.id);if(!result.changes)fail(404,'Finding not found.');res.json({ok:true});});
 const uploader=multer({storage:multer.diskStorage({destination:uploads,filename:(req,file,cb)=>cb(null,randomUUID())}),limits:{fileSize:25*1024*1024,files:1,fields:5}});
 app.post('/api/audits/:id/files',(req,res,next)=>{audit(req.params.id);next()},uploader.single('file'),async(req,res)=>{const f=req.file;if(!f)fail(400,'Select a file.');let inserted=false;try{const area=req.body.area?choice(req.body.area,areaIds):'';const fid=req.body.findingId||null;if(fid&&!db.prepare('SELECT id FROM findings WHERE id=? AND audit_id=?').get(fid,req.params.id))fail(400,'Invalid finding.');let image=0;if(f.mimetype.startsWith('image/')){try{await sharp(f.path,{limitInputPixels:50_000_000}).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).png().toFile(f.path+'.png');image=1}catch{fail(400,'This image cannot be processed. Use JPEG, PNG, WebP or TIFF.')}}const record={id:f.filename,audit_id:req.params.id,name:path.basename(f.originalname).slice(0,300),mime:f.mimetype,size:f.size,area,finding_id:fid,caption:text(req.body.caption,2000),image,created_at:now()};db.prepare('INSERT INTO evidence VALUES(?,?,?,?,?,?,?,?,?,?)').run(...Object.values(record));inserted=true;res.status(201).json(record);}finally{if(!inserted){await unlink(f.path).catch(()=>{});await unlink(f.path+'.png').catch(()=>{})}}});
 function evidence(id){const f=db.prepare('SELECT * FROM evidence WHERE id=?').get(id);if(!f)fail(404,'Evidence not found.');return f;}
 app.get('/api/files/:id',(req,res)=>{const f=evidence(req.params.id);if(!existsSync(path.join(uploads,f.id)))fail(404,'Original file is missing.');res.download(path.join(uploads,f.id),f.name);});
 app.get('/api/files/:id/preview',(req,res)=>{const f=evidence(req.params.id);if(!f.image)fail(404,'No image preview.');res.type('png').sendFile(path.join(uploads,f.id+'.png'));});
 app.patch('/api/files/:id',(req,res)=>{const f=evidence(req.params.id),area=req.body.area?choice(req.body.area,areaIds):'',fid=req.body.findingId||null;if(fid&&!db.prepare('SELECT id FROM findings WHERE id=? AND audit_id=?').get(fid,f.audit_id))fail(400,'Invalid finding.');db.prepare('UPDATE evidence SET caption=?,area=?,finding_id=? WHERE id=?').run(text(req.body.caption,2000),area,fid,f.id);res.json(evidence(f.id));});
 app.delete('/api/files/:id',async(req,res)=>{const f=evidence(req.params.id);db.prepare('DELETE FROM evidence WHERE id=?').run(f.id);await unlink(path.join(uploads,f.id)).catch(()=>{});await unlink(path.join(uploads,f.id+'.png')).catch(()=>{});res.json({ok:true});});
 app.get('/api/audits/:id/report',async(req,res)=>{const data=detail(req.params.id);const origin=publicUrl||`http://127.0.0.1:${options.port||process.env.PORT||5180}`;const buffer=await makeReport(data,uploads,origin);res.set('Content-Disposition',`attachment; filename*=UTF-8''${encodeURIComponent(data.name+' - IT Audit.docx')}`).type('application/vnd.openxmlformats-officedocument.wordprocessingml.document').send(buffer);});
 app.get('/api/audits/:id/export',(req,res)=>res.attachment('audit-data.json').json({format:'fieldbook-vps-1',exportedAt:now(),audit:detail(req.params.id)}));
 app.use('/api',(req,res)=>res.status(404).json({error:'Endpoint not found.'}));
 app.use(express.static(path.join(root,'public'),{etag:true}));
 app.use((err,req,res,next)=>{console.error(err.message);res.status(err.code==='LIMIT_FILE_SIZE'?413:err.status||500).json({error:err.code==='LIMIT_FILE_SIZE'?'File exceeds the 25 MB limit.':err.status?err.message:'The request failed. Your draft is kept; please retry.'});});
 return {app,db,directory};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const host=process.env.HOST||'127.0.0.1';
 if(!['127.0.0.1','localhost','::1'].includes(host)&&(!process.env.APP_PASSWORD||process.env.APP_PASSWORD.length<12))throw Error('Set APP_PASSWORD to at least 12 characters before listening on a public interface.');
 if(process.env.NODE_ENV==='production'&&(!process.env.APP_PASSWORD||process.env.APP_PASSWORD.length<12))throw Error('Production requires APP_PASSWORD with at least 12 characters.');
 if(process.env.APP_PASSWORD&&process.env.APP_PASSWORD.length<12)throw Error('APP_PASSWORD must have at least 12 characters.');
 const {app,db}=createApp();const server=app.listen(Number(process.env.PORT||5180),host,()=>console.log(`Fieldbook: http://${host}:${process.env.PORT||5180} — ${process.env.APP_PASSWORD?'password protected':'local access only'}`));
 const stop=()=>server.close(()=>{db.close();process.exit(0)});process.on('SIGINT',stop);process.on('SIGTERM',stop);
}

