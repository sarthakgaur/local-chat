const Pool = require("pg").Pool;

const pool = new Pool({
  user: "dv",
  password: process.env.password,
  host: "localhost",
  port: 5432,
  database: "local_chat"
});

module.exports = pool;
