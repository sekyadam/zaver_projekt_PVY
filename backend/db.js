const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "mysqlstudenti.litv.sssvt.cz",
  port: 3306,                           
  user: "sekyrkaadam",
  password: "123456",
  database: "4c2_sekyrkaadam_db1",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
