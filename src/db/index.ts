import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export let db = drizzle(pool, {schema});

export function setTestDb(testConnectionString: string) {
    const testPool = new Pool({ connectionString: testConnectionString });
    db = drizzle(testPool, {schema});
}

export const closeConnection = () => pool.end()