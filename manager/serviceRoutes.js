// serviceRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");  // ใช้เส้นทาง ../ เพื่อไปยังไฟล์ db.js

// เพิ่มบริการใหม่
router.post("/servicelist", (req, res) => {
    const {ser_id, ser_name, price } = req.body;

    const query = `
        INSERT INTO tbservice (ser_id, ser_name, price)
        VALUES (?, ?,?)
    `;

    db.query(query, [ser_id,ser_name, price], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        res.status(201).json({ message: "ເພີ່ມບໍລິການສຳເລັດ ✅", service_id: result.insertId });
    });
});

// ดึงข้อมูลทั้งหมดของบริการ
router.get("/servicelist", (req, res) => {
    const query = "SELECT * FROM tbservice";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນບໍລິການສຳເລັດ ✅", data: results });
    });
});

// ดึงข้อมูลบริการตาม ID
router.get("/servicelist/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbservice WHERE ser_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ບໍລິການນີ້" });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນບໍລິການສຳເລັດ ✅", data: results[0] });
    });
});

// แก้ไขข้อมูลบริการ
router.put("/servicelist/:id", (req, res) => {
    const { id } = req.params;
    const { ser_name, price } = req.body;

    const query = `
        UPDATE tbservice
        SET ser_name = ?, price = ?
        WHERE ser_id = ?
    `;

    db.query(query, [ser_name, price, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນບໍລິການນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນບໍລິການສຳເລັດ ✅" });
    });
});

// ลบข้อมูลบริการ
router.delete("/servicelist/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM tbservice WHERE ser_id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລຶບຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ບໍລິການນີ້" });
        }
        res.status(200).json({ message: "ລຶບຂໍ້ມູນບໍລິການສຳເລັດ ✅" });
    });
});

module.exports = router;
