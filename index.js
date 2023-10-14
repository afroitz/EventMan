import express from 'express';
import 'dotenv/config'
import pg from "pg";
import router from './src/routes/router.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static('src/public'));

const PORT = process.env.PORT

// body parser middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/', router);

app.listen(PORT, console.log("App listening on port " + PORT))

export default pool;