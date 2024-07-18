-- 000001_hello_migrations.up.sql

CREATE TABLE hello_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);