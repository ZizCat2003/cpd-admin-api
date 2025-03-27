const express = require("express");
const router = express.Router();
const db = require("../db");

// เพิ่มข้อมูลอัตราแลกเปลี่ยน
router.post("/exchange", (req, res) => {
    const { ex_id, ex_type, ex_rate } = req.body;

    const query = `
        INSERT INTO tbexchange (ex_id, ex_type, ex_rate)
        VALUES (?, ?, ?)
    `;

    db.query(query, [ex_id, ex_type, ex_rate], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນອັດຕາແລກປ່ຽນ ❌", details: err });
        }
        res.status(201).json({ message: "ເພີ່ມຂໍ້ມູນອັດຕາແລກປ່ຽນສຳເລັດ ✅", ex_id: result.insertId });
    });
});

// ดึงข้อมูลทั้งหมด
router.get("/exchange", (req, res) => {
    const query = "SELECT * FROM tbexchange";

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນອັດຕາແລກປ່ຽນ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນສຳເລັດ ✅", data: results });
    });
});

// ดึงข้อมูลตาม ex_id
router.get("/exchange/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbexchange WHERE ex_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນ ❌", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນສຳເລັດ ✅", data: results[0] });
    });
});

// แก้ไขข้อมูล
router.put("/exchange/:id", (req, res) => {
    const { id } = req.params;
    const { ex_type, ex_rate } = req.body;

    const query = `
        UPDATE tbexchange
        SET ex_type = ?, ex_rate = ?
        WHERE ex_id = ?
    `;

    db.query(query, [ex_type, ex_rate, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນສຳເລັດ ✅" });
    });
});

// ลบข้อมูล
router.delete("/exchange/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM tbexchange WHERE ex_id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລຶບຂໍ້ມູນ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
        }
        res.status(200).json({ message: "ລຶບຂໍ້ມູນສຳເລັດ ✅" });
    });
});

module.exports = router;
