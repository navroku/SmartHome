// routes/db.js
const mysql = require('mysql2/promise');
const result = require('dotenv').config();

if (result.error) {
  console.error('Error parsing .env file:', result.error);
} else {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = result.parsed;
  process.env.DB_HOST = DB_HOST;
  process.env.DB_USER = DB_USER;
  process.env.DB_PASSWORD = DB_PASSWORD;
  process.env.DB_DATABASE = DB_DATABASE;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,     
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
