// categoryRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../db");  // ใช้เส้นทาง ../ เพื่อไปยังไฟล์ db.js

// routes/category.js  (หรือไฟล์ router ของคุณ)
router.post("/category", (req, res) => {
    const { medtype_id, type_name } = req.body;
  
    // ระบุสองคอลัมน์ให้ตรงกับสองค่า
    const query = `
      INSERT INTO tbmedicinestype (medtype_id, type_name)
      VALUES (?, ?)
    `;
  
    db.query(query, [medtype_id, type_name], (err, result) => {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({
          error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນປະເພດຢາ ❌",
          details: err,
        });
      }
      // สำเร็จ จะได้ insertId กลับมา (แต่ถ้าใช้ PK เอง ก็อาจไม่จำเป็น)
      res.status(200).json({
        message: "ເພີ່ມຂໍ້ມູນປະເພດຢາສຳເລັດ ✅",
        medtype_id: result.insertId,
      });
    });
  });
  
// ดึงข้อมูลทั้งหมดของประเภทยา
router.get("/category", (req, res) => {
    const query = "SELECT * FROM tbmedicinestype";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນປະເພດຢາ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນປະເພດຢາສຳເລັດ ✅", data: results });
    });
});

// ดึงข้อมูลประเภทยาตาม type_id
router.get("/category/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbmedicinestype WHERE medtype_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນປະເພດຢາ ❌", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ປະເພດຢານີ້" });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນປະເພດຢາສຳເລັດ ✅", data: results[0] });
    });
});

// แก้ไขข้อมูลประเภทยา
router.put("/category/:id", (req, res) => {
    const { id } = req.params;
    const { type_name } = req.body;

    const query = `
        UPDATE tbmedicinestype
        SET type_name = ?
        WHERE medtype_id = ?
    `;

    db.query(query, [type_name, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນປະເພດຢາ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນປະເພດຢານີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນປະເພດຢາສຳເລັດ ✅" });
    });
});

// ลบข้อมูลประเภทยา
router.delete("/category/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM tbmedicinestype WHERE medtype_id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລຶບຂໍ້ມູນປະເພດຢາ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ປະເພດຢານີ້" });
        }
        res.status(200).json({ message: "ລຶບຂໍ້ມູນປະເພດຢາສຳເລັດ ✅" });
    });
});

module.exports = router;

