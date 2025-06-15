const Sequelize = require("sequelize");
const sequelize = require("./db_instance");

const user = sequelize.define(
  "user",
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: "normal"
    }
  },
  {
    timestamps: false,       // ✅ ไม่สร้าง createdAt, updatedAt
    freezeTableName: true,   // ✅ ใช้ชื่อตารางตามที่ระบุแบบตรงตัว
  }
);

// (async () => {
//   await user.sync({
//     // force: false,
//     alter: true
//   });
// })();

module.exports = user;
