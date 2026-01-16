import { Pool } from 'pg';
import envs from './env';
import { handleDbError } from '../utils/dbErrorHandler';

const pool = new Pool({
  user: envs.db.DB_USER,
  host: envs.db.DB_HOST,
  database: envs.db.DB_NAME,
  password: envs.db.DB_PASSWORD,
  port: Number(envs.db.DB_PORT),
});


export async function query<T = any>(sql: string, values?: any[]): Promise<T[]> {
  try {
    const result = await pool.query(sql, values ?? []);
    return result.rows as T[];
  } catch (err: any) {
    throw handleDbError<any>(err, {
      logError: true,
      returnEmptyOnError: true,
    });
  }
}

export async function closePool() {
  await pool.end();
  console.log('DB connection pool closed');
}

export default pool;
