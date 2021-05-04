import pg from "pg";
import dotenv from "dotenv";

const Pool = pg.Pool;
dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || ""),
  database: process.env.DB_DATABASE,
});

export async function query(text: string, params?: Array<any>) {
  const start = Date.now();
  const results = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("Executed query:", {
    text,
    params,
    duration,
    rows: results.rowCount,
    firstRow: results.rows[0],
  });
  return results;
}
