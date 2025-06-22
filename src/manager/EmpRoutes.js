const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/emp", (req, res) => {
    const { emp_id, emp_name, emp_surname, gender, dob, phone, address, role } = req.body;

    const query = `
        INSERT INTO tbemployee (emp_id, emp_name, emp_surname, gender, dob, phone, address, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [emp_id, emp_name, emp_surname, gender, dob, phone, address, role], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນໄດ້", details: err });
        }
        res.status(201).json({ message: "ເພີ່ມຂໍ້ມູນສຳເລັດ", emp_id: emp_id });
    });
});

// เพิ่ม endpoint สำหรับดึงรหัสล่าสุดของบริการทั่วไป (NOT PACKAGE)
router.get("/next-emp-id", (req, res) => {
    const query = `
        SELECT emp_id FROM tbemployee WHERE emp_id LIKE 'EMP%' ORDER BY emp_id DESC LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດ ❌", details: err });
        }
        
        let nextId = "EMP01"; // รหัสเริ่มต้น
        
        if (results.length > 0) {
            const lastId = results[0].emp_id;
            const lastNumber = parseInt(lastId.substring(3));
            const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
            nextId = `EMP${nextNumber}`;
        }
        
        res.status(200).json({ 
            message: "ດຶງລະຫັດຖັດໄປສຳເລັດ ✅", 
            nextId: nextId 
        });
    });
});

router.get("/emp", (req, res) => {
    const query = "SELECT * FROM tbemployee";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້", details: err });
        }
        res.status(200).json({ message: "ດຶງຂໍ້ມູນສຳເລັດ", data: results });
    });
});


router.get("/emp/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM tbemployee WHERE emp_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ຜິດພາດໃນການດຶງຂໍ້ມູນ", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ emp_id ນີ້" });
        }
        res.status(200).json({ message: "ດຶງຂໍ້ມູນສຳເລັດ", data: results[0] });
    });
});




// 
router.put("/emp/:id", (req, res) => {
    const { id } = req.params;
    const { emp_name, emp_surname, gender, dob, phone, address, role } = req.body;

    const query = `
        UPDATE tbemployee
        SET emp_name = ?, emp_surname = ?, gender = ?, dob = ?, phone = ?, address = ?, role = ?
        WHERE emp_id = ?
    `;

    db.query(query, [emp_name, emp_surname, gender, dob, phone, address, role, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ແກ້ໄຂຂໍ້ມູນຜິດພາດ", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ emp_id ທີ່ຈະແກ້ໄຂ" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນສຳເລັດ" });
    });
});

router.delete("/emp/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM tbemployee WHERE emp_id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ຜິດພາດໃນການລົບຂໍ້ມູນ", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ emp_id ທີ່ຈະລົບ" });
        }
        res.status(200).json({ message: "ລົບຂໍ້ມູນສຳເລັດ" });
    });
});

module.exports = router;
