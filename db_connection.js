import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

// 1: to connect to db
const db_connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.PORT_SQL_DB
});
// console.log("Database connected successfully");

export default db_connection;
