import pg from 'pg';
export function database(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL_REQUIRED');return new pg.Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:5000,statement_timeout:20000});}
