// db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    // host: "172.28.26.181",
    // user: "admin_smt",
    // database: "Test",
    // password: "smt@#2022",
    // host: "localhost",
    // user: "root",
    // database: "dbcps_data",
    // password: "",
    // port: 3306
});
const color = {
    red: "\x1b[31m",
};
db.connect((err) => {
    if (err) {
        console.error(color.red + "❌❌❌ Unable to connect to database. ❌❌❌");
        console.error(err);
        return;
    }
    // console.log("╔══════════════════════════════════════════════════╗");
    // console.log("║                                                  ║");
    // console.log("║ ✅ Database Connected Successfully!   🚀 🚀 🚀   ║");
    // console.log("║                                                  ║");
    // console.log("╚══════════════════════════════════════════════════╝");
});

module.exports = db;

// const sql = require('mssql'); // ทำการ import mssql ไลบรารี
// const config = {
//     user: 'mc', // ชื่อผู้ใช้ SQL Server
//     password: '12345678ww', // รหัสผ่านของ SQL Server
//     server: 'DESKTOP-0BO74E2\\SQLEXPRESS',  // หรือชื่อโฮสต์ของ SQL Server
//     database: 'dbcps', // ชื่อฐานข้อมูล
//     port: 1433, // พอร์ตที่ SQL Server ใช้งาน (พอร์ตเริ่มต้นของ SQL Server คือ 1433)
//     options: {
//       encrypt: true, // ถ้าคุณใช้การเข้ารหัส SSL สำหรับการเชื่อมต่อ
//       trustServerCertificate: true // ถ้าคุณต้องการข้ามการตรวจสอบใบรับรอง SSL
//     }
//   };
  
// sql.connect(config)
//   .then(pool => {
//     console.log('Connected to SQL Server');
//     return pool.request().query('SELECT * FROM your_table');
//   })
//   .then(result => {
//     console.log(result.recordset); // จะแสดงข้อมูลจาก SQL Server
//   })
//   .catch(err => {
//     console.error('SQL connection error:', err); // จับข้อผิดพลาด
//   });