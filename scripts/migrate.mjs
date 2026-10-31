import { readFile,readdir } from 'node:fs/promises';
import { database } from '../server/database.mjs';
const db=database();const client=await db.connect();
try{
 await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(392871)');
 await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY,applied_at timestamptz DEFAULT now())');
 for(const file of (await readdir('postgres/migrations')).filter(x=>/^\d{3}_[a-z0-9_]+\.sql$/.test(x)).sort()){
  const version=file.slice(0,3),exists=await client.query('SELECT 1 FROM schema_migrations WHERE version=$1',[version]);
  if(!exists.rows.length){await client.query(await readFile(`postgres/migrations/${file}`,'utf8'));await client.query('INSERT INTO schema_migrations(version) VALUES($1)',[version]);}
 }
 await client.query('COMMIT');console.log('Database migrations applied or already current');
}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await db.end();}
