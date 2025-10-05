import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool() {
  if (pool) {
    return pool;
  }

  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set.');
  }

  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  return pool;
}
