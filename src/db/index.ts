import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export let db = drizzle(pool);

export function setTestDb(testConnectionString: string) {
    const testPool = new Pool({ connectionString: testConnectionString });
    db = drizzle(testPool);
}

export const closeConnection = () => pool.end()