import {sqliteTable,text,index,integer} from 'drizzle-orm/sqlite-core';
export const audits=sqliteTable('audits',{id:text('id').primaryKey(),owner:text('owner').notNull(),data:text('data').notNull(),updated:text('updated').notNull()},t=>[index('audits_owner').on(t.owner)]);
export const findings=sqliteTable('findings',{id:text('id').primaryKey(),auditId:text('audit_id').notNull().references(()=>audits.id),data:text('data').notNull()},t=>[index('findings_audit').on(t.auditId)]);
export const evidence=sqliteTable('evidence',{id:text('id').primaryKey(),auditId:text('audit_id').notNull().references(()=>audits.id),name:text('name').notNull(),mime:text('mime').notNull(),size:integer('size').notNull(),caption:text('caption').notNull().default('')},t=>[index('evidence_audit').on(t.auditId)]);
