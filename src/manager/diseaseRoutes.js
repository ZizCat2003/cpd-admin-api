const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/disease", (req, res) => {
    const { disease_id, disease_name } = req.body;

    const query = `
        INSERT INTO tbdisease (disease_id, disease_name)
        VALUES (?, ?)
    `;

    db.query(query, [disease_id, disease_name], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນລາຍການໂຣກ ❌", details: err });
        }
        res.status(200).json({ message: "ເພີ່ມຂໍ້ມູນລາຍການໂຣກສຳເລັດ ✅", disease_id: result.insertId });
    });
});

router.get("/disease", (req, res) => {
    const query = "SELECT * FROM tbdisease";

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນໂຣກ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນສຳເລັດ ✅", data: results });
    });
});

// เพิ่ม endpoint สำหรับดึงรหัสล่าสุดของบริการทั่วไป (NOT PACKAGE)
router.get("/next-disease-id", (req, res) => {
    const query = `
        SELECT disease_id FROM tbdisease WHERE disease_id LIKE 'DS%' ORDER BY disease_id DESC LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດ ❌", details: err });
        }
        
        let nextId = "DS01"; // รหัสเริ่มต้น
        
        if (results.length > 0) {
            const lastId = results[0].disease_id;
            const lastNumber = parseInt(lastId.substring(2));
            const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
            nextId = `DS${nextNumber}`;
        }
        
        res.status(200).json({ 
            message: "ດຶງລະຫັດຖັດໄປສຳເລັດ ✅", 
            nextId: nextId 
        });
    });
});

router.get("/disease/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbdisease WHERE disease_id = ?";
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

router.put("/disease/:id", (req, res) => {
    const { id } = req.params;
    const { disease_name } = req.body;

    const query = `
        UPDATE tbdisease
        SET disease_name = ?
        WHERE disease_id = ?
    `;

    db.query(query, [disease_name, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໂຣກ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນສຳເລັດ ✅" });
    });
});

router.delete("/disease/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM tbdisease WHERE disease_id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລຶບຂໍ້ມູນໂຣກ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
        }
        res.status(200).json({ message: "ລຶບຂໍ້ມູນສຳເລັດ ✅" });
    });
});

module.exports = router;
