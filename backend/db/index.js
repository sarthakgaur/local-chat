const Pool = require("pg").Pool;
require("dotenv").config();

let pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

async function query(text, params) {
  let start = Date.now();
  let results = await pool.query(text, params);
  let duration = Date.now() - start;
  console.log("Executed query:", {
    text,
    params,
    duration,
    rows: results.rowCount,
    result: results.rows[0],
  });
  return results;
}

module.exports = { query, pool };
