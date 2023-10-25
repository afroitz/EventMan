#!/bin/bash

source .env

createuser -U postgres -h $DB_HOST -p $DB_PORT --interactive -e $DB_USER
createdb -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME

psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'

psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -c 'DROP TABLE IF EXISTS events;'

psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -c "CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE DEFAULT uuid_generate_v4(), 
    origin VARCHAR(255) DEFAULT '$APP_URL',
    published TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255),
    date TIMESTAMP NULL,
    summary TEXT,
    author JSONB
  );"
