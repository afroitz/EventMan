import express from 'express';
import 'dotenv/config'
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PW,
  port: process.env.DP_PORT,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const app = express();
const PORT = process.env.PORT

app.use('/', router);

app.listen(PORT, console.log("App listening on port " + PORT))

export default pool;