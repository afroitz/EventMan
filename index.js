import express from 'express';
import 'dotenv/config'
import pg from "pg";
import router from './src/routes/router.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import { CronJob } from 'cron';
import EventService from './src/services/EventService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const pool = process.env.DATABASE_ENVIRONMENT === 'development' ? new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PW,
  port: Number(process.env.DB_PORT),
}) : new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static('src/public'));

const PORT = process.env.PORT


// Session management middleware
app.use(session({
  secret: 'secret', //PLACEHOLDER
  resave: false,
  saveUninitialized: true,
}));

// body parser middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/', router);

app.listen(PORT, () => console.log("App listening on port " + PORT))

// register cron job for adding events via gpt api
/* const jobEventService = new EventService();
const gptJob = new CronJob(
  '0 0 0,12 * * *',
  async () => {
    console.log("Running GPT Job")
    try {
      await jobEventService.getSampleEvent();
    } catch (err) {
      console.log(err);
    }
  },
  null,
  true,
  'Europe/Berlin'
); */

export default pool;