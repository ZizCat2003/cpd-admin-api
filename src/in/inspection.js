const express = require("express");
const router = express.Router();
const db = require("../../db");

// ➕ เพิ่มข้อมูลการตรวจ
router.post("/inspection", (req, res) => {
    console.log('object');
    const { in_id, date, diseases_now, symptom, note, status, patient_id, diseases_id, emp_id } = req.body;

    const query = `
      INSERT INTO tbinspection 
      (in_id, date, diseases_now, symptom, note, status, patient_id, diseases_id, emp_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [in_id, date, diseases_now, symptom, note, status, patient_id, diseases_id, emp_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມການກວດສອບ ❌", details: err });
        }
        res.status(201).json({ message: "ເພີ່ມການກວດສຳເລັດ ✅", in_id });
    });
});

// 🔍 ดึงข้อมูลทั้งหมด
router.get("/inspection", (req, res) => {
    console.log('kkk');
    const query = "SELECT * FROM tbinspection";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນ ❌", details: err });
        }
        res.status(200).json({ message: "ດຶງຂໍ້ມູນການກວດສຳເລັດ ✅", data: results });
    });
});

// 🔍 ดึงตาม in_id
router.get("/inspection/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM tbinspection WHERE in_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນ ❌", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ in_id ທີ່ລະບຸ" });
        }
        res.status(200).json({ message: "ດຶງຂໍ້ມູນສຳເລັດ ✅", data: results[0] });
    });
});

// ✏️ ແກ້ໄຂຂໍ້ມູນ
router.put("/inspection/:id", (req, res) => {
    const { id } = req.params;
    const { date, diseases_now, symptom, note, status, patient_id, diseases_id, emp_id } = req.body;

    const query = `
        UPDATE tbinspection
        SET date = ?, diseases_now = ?, symptom = ?, note = ?, status = ?, patient_id = ?, diseases_id = ?, emp_id = ?
        WHERE in_id = ?
    `;

    db.query(query, [date, diseases_now, symptom, note, status, patient_id, diseases_id, emp_id, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ in_id ທີ່ຈະແກ້ໄຂ" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນສຳເລັດ ✅" });
    });
});

// ❌ ລຶບຂໍ້ມູນ
router.delete("/inspection/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM tbinspection WHERE in_id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລຶບຂໍ້ມູນ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ in_id ທີ່ຈະລຶບ" });
        }
        res.status(200).json({ message: "ລຶບຂໍ້ມູນສຳເລັດ ✅" });
    });
});

module.exports = router;
