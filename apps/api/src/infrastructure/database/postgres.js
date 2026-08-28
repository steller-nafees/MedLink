const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl:
          process.env.DB_SSL === "false"
            ? false
            : { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl:
          process.env.DB_SSL === "true"
            ? { rejectUnauthorized: false }
            : false,
      }
);

module.exports = pool;
