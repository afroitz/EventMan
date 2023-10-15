# EventMan
A groundbreaking event management system created by:
- Andre Winzen 6062288
- Alex Froitzheim 7340859

## Running locally
- Clone the repository
- Create an `.env` file in the root directory with the following content (modify the values in angle brackets):
```
PORT=4111
TEST_USER=<choose_a_username>
TEST_PASSWORD=<choose_a_password>

DB_HOST=localhost
DB_PORT=5432
DB_USER=<choose_db_user>
DB_NAME=<choose_db_name>
DB_PW=<choose_db_password>


APP_URL=http://localhost:4111
DATABASE_ENVIRONMENT=development
```
- Make sure postgres is installed and superuser postgres exists
- Run `npm install`
- Run `npm run init-db`
- Run `npm run develop`