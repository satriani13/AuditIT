import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createApp} from '../src/server.js';
const require=createRequire(import.meta.url);
const JSZip=require(require.resolve('jszip',{paths:[path.dirname(require.resolve('docx'))]}));
const password='test-password-for-fieldbook';
const directory=mkdtempSync(path.join(tmpdir(),'fieldbook-test-'));
let runtime,server,base,cookie;
async function start(){runtime=createApp({directory,password,publicUrl:'https://audit.example.test'});server=runtime.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;}
async function stop(){await new Promise(r=>server.close(r));runtime.db.close();}
async function request(route,{method='GET',body,auth=true,header=true}={}){const res=await fetch(base+'/api/'+route,{method,headers:{...(auth&&cookie?{cookie}:{}),...(header?{'X-Fieldbook':'1'}:{}),...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{})},body:body instanceof FormData?body:body?JSON.stringify(body):undefined});return res;}
async function ok(route,opts){const r=await request(route,opts);const data=await r.json();assert.ok(r.ok,JSON.stringify(data));return data;}
const auditBody={name:'QA factory',location:'Madrid',type:'Factory',date:'2026-09-10',auditor:'QA Auditor',status:'In progress',summary:'Validate the acquisition audit workflow.'};
test('VPS workflow, access protection, durable SQLite data and Word evidence',async t=>{await start();t.after(async()=>{await stop()});
 assert.equal((await request('audits',{auth:false})).status,401);
 assert.equal((await request('login',{method:'POST',body:{password:'incorrect'}})).status,401);
 const login=await request('login',{method:'POST',body:{password}});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];
 assert.match(login.headers.get('set-cookie'),/HttpOnly/);assert.match(login.headers.get('set-cookie'),/Secure/);
 assert.equal((await request('audits',{method:'POST',body:auditBody,header:false})).status,403);
 const templateAreas=await ok('templates');assert.equal(templateAreas.length,8);assert.equal(templateAreas.flatMap(a=>a.checks).length,64);
 const a=await ok('audits',{method:'POST',body:auditBody});let full=await ok('audits/'+a.id);assert.equal(full.checks.length,64);assert.equal(full.findings.length,0);assert.ok(full.checks.every(c=>c.status==='Not reviewed'));
 const check=full.checks[0];const reviewed=await ok(`audits/${a.id}/checks/${check.id}`,{method:'PATCH',body:{version:check.version,status:'Issue',notes:'Door was unlocked during the site visit.'}});assert.equal(reviewed.status,'Issue');
 assert.equal((await request(`audits/${a.id}/checks/${check.id}`,{method:'PATCH',body:{version:check.version,status:'Pass'}})).status,409);
 const f=await ok(`audits/${a.id}/findings`,{method:'POST',body:{title:check.finding,area:check.area,severity:check.severity,status:'Open',notes:'Access was not restricted.',recommendation:check.recommendation,templateId:check.id,owner:'Facilities manager',due:'2026-10-01'}});
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aC9sAAAAASUVORK5CYII=','base64');
 const form=new FormData();form.append('area',check.area);form.append('findingId',f.id);form.append('caption','Server room door');form.append('file',new Blob([image],{type:'image/png'}),'door.png');const evidence=await ok(`audits/${a.id}/files`,{method:'POST',body:form});assert.equal(evidence.image,1);
 const downloaded=await request('files/'+evidence.id);assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()),image);assert.equal((await request('files/'+evidence.id+'/preview')).status,200);assert.equal((await request('files/'+evidence.id,{auth:false})).status,401);
 const invalid=new FormData();invalid.append('file',new Blob(['not an image'],{type:'image/png'}),'fake.png');assert.equal((await request(`audits/${a.id}/files`,{method:'POST',body:invalid})).status,400);
 const spreadsheet=new FormData();spreadsheet.append('file',new Blob(['asset,owner\nserver,IT'],{type:'text/csv'}),'assets.csv');await ok(`audits/${a.id}/files`,{method:'POST',body:spreadsheet});
 const second=await ok('audits',{method:'POST',body:{...auditBody,name:'QA office',type:'Office'}});assert.equal((await ok('audits/'+second.id)).checks[0].status,'Not reviewed');
 const cross=new FormData();cross.append('findingId',f.id);cross.append('file',new Blob(['test']),'cross.txt');assert.equal((await request(`audits/${second.id}/files`,{method:'POST',body:cross})).status,400);
 await stop();await start();full=await ok('audits/'+a.id);assert.equal(full.findings[0].title,check.finding);assert.equal(full.files.length,2);assert.equal(full.checks[0].notes,'Door was unlocked during the site visit.');
 const report=await request(`audits/${a.id}/report`);assert.equal(report.status,200);const buffer=Buffer.from(await report.arrayBuffer());const zip=await JSZip.loadAsync(buffer);const xml=await zip.file('word/document.xml').async('string');assert.match(xml,/Server room door/);assert.match(xml,/Access was not restricted/);assert.match(xml,/Door was unlocked/);assert.match(xml,/w:drawing/);assert.ok(Object.keys(zip.files).some(n=>n.startsWith('word/media/')&&!zip.files[n].dir));assert.match(await zip.file('word/_rels/document.xml.rels').async('string'),/https:\/\/audit.example.test\/api\/files/);
 const edited=await ok(`audits/${a.id}/findings/${f.id}`,{method:'PATCH',body:{...full.findings[0],status:'Resolved'}});assert.equal(edited.status,'Resolved');
 assert.equal((await request(`audits/${a.id}/findings/${f.id}`,{method:'PATCH',body:{...full.findings[0],status:'Open'}})).status,409);
 await ok(`audits/${a.id}/findings/${f.id}`,{method:'DELETE'});assert.equal((await ok('audits/'+a.id)).files[0].finding_id,null);
 await ok('files/'+evidence.id,{method:'DELETE'});assert.equal((await request('files/'+evidence.id)).status,404);
 await ok('logout',{method:'POST'});assert.equal((await request('audits')).status,401);
 console.log('64 templates; review and finding CRUD; version conflicts; attachment validation and ownership; restart persistence; authenticated files; DOCX content and embedded images: verified.');
});
