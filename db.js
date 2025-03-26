// db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dbcpsc_admin",
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.log('❌❌❌ ບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້ ❌❌❌');
        return;
    }
    console.log('|🎉-------------------------------------------------🎉|');
    console.log('|                                                      |');
    console.log('|          🚀 ເຊື່ອມຕໍ່ໄດ້ສຳເລັດແລ້ວ  ✅✅✅               |');
    console.log('|                                                      |');
    console.log('|🎉-------------------------------------------------🎉|');

});

module.exports = db;
