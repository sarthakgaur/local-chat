const Pool = require("pg").Pool;

let pool = new Pool({
  user: "dv",
  password: process.env.password,
  host: "localhost",
  port: 5432,
  database: "local_chat"
});

async function query(text, params) {
  let start = Date.now();
  let results = await pool.query(text, params);
  let duration = Date.now() - start;
  console.log("Executed query:", { text, params, duration, rows: results.rowCount });
  return results;
}

module.exports = { query, pool };
