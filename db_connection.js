import mysql from "mysql2/promise";

// 1: to connect to the mysql server
const db_connection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Djx4uce9q3@8507",
  database: "personal_finance",
});
// console.log("mysql connected successfully");

export default db_connection;
