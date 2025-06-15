// db_instance.js
const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   "Test", // e.g., 'myapp_db'
//   "admin_smt", // e.g., 'root'
//   "smt@#2022", // e.g., 'password'
//   {
//     host: "172.28.26.181",
//     dialect: "mysql", // <-- change from 'sqlite' to 'mysql'
//     logging: true,     // optional
//     port: 3306         // default MySQL port
//   }
// );
const sequelize = new Sequelize(
  "dbcps_data", // e.g., 'myapp_db'
  "root", // e.g., 'root'
  "", // e.g., 'password'
  {
    host: "localhost",
    dialect: "mysql", // <-- change from 'sqlite' to 'mysql'
    logging: false,     // optional
    port: 3306         // default MySQL port
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connection established.");
  } catch (error) {
    // console.error("❌ Unable to connect to the MySQL database:", error);
  }
})();

module.exports = sequelize;