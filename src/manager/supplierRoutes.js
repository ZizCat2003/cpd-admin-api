const express = require("express");
const router = express.Router();
const db = require("../../db"); 

// ✅ เพิ่ม Supplier ใหม่
router.post("/supplier", (req, res) => {
    const { sup_id, company_name, address, phone, status } = req.body;

    const query = `
        INSERT INTO tbsupplier (sup_id, company_name, address, phone, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [sup_id, company_name, address, phone, status], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນ Supplier ❌", details: err });
        }
        res.status(201).json({ message: "ເພີ່ມ Supplier ສຳເລັດ ✅", supplier_id: result.insertId });
    });
});

// ✅ ดึงข้อมูล Supplier ทั้งหมด
router.get("/supplier", (req, res) => {
    const query = "SELECT * FROM tbsupplier";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນ Supplier ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນ Supplier ສຳເລັດ ✅", data: results });
    });
});

// ✅ ดึงข้อมูล Supplier ตาม ID
router.get("/supplier/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbsupplier WHERE sup_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນ Supplier ❌", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id Supplier ນີ້" });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນ Supplier ສຳເລັດ ✅", data: results[0] });
    });
});

// ✅ แก้ไขข้อมูล Supplier
router.put("/supplier/:id", (req, res) => {
    const { id } = req.params;
    const { company_name, address, phone, status } = req.body;

    const query = `
        UPDATE tbsupplier
        SET company_name = ?, address = ?, phone = ?, status = ?
        WHERE sup_id = ?
    `;

    db.query(query, [company_name, address, phone, status, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນ Supplier ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ Supplier ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນ Supplier ສຳເລັດ ✅" });
    });
});

// ✅ ลบข้อมูล Supplier
router.delete("/supplier/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM tbsupplier WHERE sup_id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລຶບຂໍ້ມູນ Supplier ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id Supplier ນີ້" });
        }
        res.status(200).json({ message: "ລຶບຂໍ້ມູນ Supplier ສຳເລັດ ✅" });
    });
});

module.exports = router;
