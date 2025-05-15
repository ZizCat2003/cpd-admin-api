// patientRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../db"); 


router.post("/patient", (req, res) => {
    console.log(req.body); // Debugging ข้อมูลที่ถูกส่งมา

    const { patient_id, patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district } = req.body;

    const query = `
        INSERT INTO tbPatient (patient_id, patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [patient_id, patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district], (err, result) => {
        if (err) {
            console.error("SQL Error:", err); // Log Error
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນໄດ້ ", details: err });
        }
        res.status(201).json({ message: "ເພີ່ມຂໍ້ມູນສຳເລັດ ✅", patient_id: result.insertId });
    });
});


router.get("/patient", (req, res) => {
    const query = "SELECT * FROM tbPatient";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນ ", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນຄົນເຈັບໄດ້ສຳເລັດແລ້ວ ✅", data: results });
    });
});

// ดึงข้อมูลคนเจ็บที่มี id เฉพาะ
router.get("/patient/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbPatient WHERE patient_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນ ", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນຄົນເຈັບໄດ້ສຳເລັດແລ້ວ ✅", data: results[0] });
    });
});

// แก้ไขข้อมูลคนเจ็บ
router.put("/patient/:id", (req, res) => {
    const { id } = req.params;
    const { patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district } = req.body;

    const query = `
        UPDATE tbPatient
        SET patient_name = ?, patient_surname = ?, gender = ?, dob = ?, phone1 = ?, phone2 = ?, village = ?, province = ?, district = ?
        WHERE patient_id = ?
    `;

    db.query(query, [patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນ ", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບການແກ້ໄຂຂໍ້ມູນຂອງຄົນເຈັບນິ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ ✅" });
    });
});

// ลบข้อมูลคนเจ็บ
router.delete("/patient/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM tbPatient WHERE patient_id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລົບຂໍ້ມູນຄົນເຈັບໄດ້ ", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນຄົນເຈັບທີ່ຕ້ອງການລົບ" });
        }
        res.status(200).json({ message: "ລົບຂໍ້ມູນສຳເລັດແລ້ວ ✅" });
    });
});

module.exports = router;
