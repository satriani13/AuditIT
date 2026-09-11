import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
export function openDatabase(directory){
 mkdirSync(directory,{recursive:true});
 const db=new DatabaseSync(path.join(directory,'fieldbook.sqlite'));
 db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 const version=db.prepare('PRAGMA user_version').get().user_version;
 if(version>1)throw Error('Database version is newer than this application.');
 if(version===0)db.exec(`BEGIN;
 CREATE TABLE audits(id TEXT PRIMARY KEY,data TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL);
 CREATE TABLE findings(id TEXT PRIMARY KEY,audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,data TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1);
 CREATE INDEX findings_audit ON findings(audit_id);
 CREATE TABLE checks(audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,template_id TEXT NOT NULL,data TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(audit_id,template_id));
 CREATE TABLE evidence(id TEXT PRIMARY KEY,audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,name TEXT NOT NULL,mime TEXT NOT NULL,size INTEGER NOT NULL,area TEXT NOT NULL DEFAULT '',finding_id TEXT REFERENCES findings(id) ON DELETE SET NULL,caption TEXT NOT NULL DEFAULT '',image INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
 CREATE INDEX evidence_audit ON evidence(audit_id);
 CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,expires INTEGER NOT NULL);
 PRAGMA user_version=1; COMMIT;`);
 return db;
}
export function unpack(row){return row?{...JSON.parse(row.data),version:row.version}:null;}
