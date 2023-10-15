#!/bin/bash

source .env

createuser -U postgres -h $DB_HOST -p $DB_PORT --interactive -e $DB_USER
createdb -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME

psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -c "CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    date TIMESTAMP,
    description TEXT
  );"
