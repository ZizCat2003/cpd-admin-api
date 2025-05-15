// medicinesRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../db");  // ใช้เส้นทาง ../ เพื่อไปยังไฟล์ db.js

// เพิ่มข้อมูลยา
router.post("/medicines", (req, res) => {
    const {med_id , med_name, qty, status, price, expired, medtype_id } = req.body;

    const query = `
        INSERT INTO tbmedicines (med_id,med_name, qty, status, price, expired, medtype_id)
        VALUES (?,?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [med_id ,med_name, qty, status, price, expired, medtype_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນຢາໄດ້ ❌", details: err });
        }
        res.status(201).json({ message: "ເພີ່ມຂໍ້ມູນຢາສຳເລັດ ✅", med_id: result.insertId });
    });
});

// ดึงข้อมูลทั้งหมดของยา
router.get("/medicines", (req, res) => {
    const query = "SELECT * FROM tbmedicines";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນຢາ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນຢາສຳເລັດ ✅", data: results });
    });
});

// ดึงข้อมูลยาตาม med_id
router.get("/medicines/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbmedicines WHERE med_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນຢາ ❌", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນຢາສຳເລັດ ✅", data: results[0] });
    });
});

// แก้ไขข้อมูลยา
router.put("/medicines/:id", (req, res) => {
    const { id } = req.params;
    const { med_name, qty, status, price, expired, medtype_id } = req.body;

    const query = `
        UPDATE tbmedicines
        SET med_name = ?, qty = ?, status = ?, price = ?, expired = ?, medtype_id = ?
        WHERE med_id = ?
    `;

    db.query(query, [med_name, qty, status, price, expired, medtype_id, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນຢາ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນຢານີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນຢາສຳເລັດ ✅" });
    });
});

// ลบข้อมูลยา
router.delete("/medicines/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM tbmedicines WHERE med_id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລົບຂໍ້ມູນຢາ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນຢານີ້" });
        }
        res.status(200).json({ message: "ລົບຂໍ້ມູນຢາສຳເລັດ ✅" });
    });
});

module.exports = router;
