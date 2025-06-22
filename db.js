// db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: "172.28.26.181",
    user: "admin_smt",
    password: "smt@#2022",
    database: "dbcpsc_admin_cc",
    port: 3306
});

// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "dbcps_data",
//     port: 3306
// });

const color = {
    red: "\x1b[31m",
};
db.connect((err) => {
    if (err) {
        console.error(color.red + "❌❌❌ Unable to connect to database. ❌❌❌");
        console.error(err);
        return;
    }
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║                                                  ║");
    console.log("║ ✅ Database Connected Successfully!   🚀 🚀 🚀   ║");
    console.log("║                                                  ║");
    console.log("╚══════════════════════════════════════════════════╝");
});

module.exports = db;
