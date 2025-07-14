const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post('/appointment', (req, res) => {
  const { appoint_id, date_addmintted, status, description, emp_id, patient_id } = req.body;

  const dateLocal = new Date(date_addmintted);
  const dateUTC = new Date(dateLocal.getTime() - dateLocal.getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 19)
                  .replace('T', ' ');

  const query = `
    INSERT INTO tbappointment (appoint_id, date_addmintted, status, description, emp_id, patient_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [appoint_id, dateUTC, status, description, emp_id, patient_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມນັດໝາຍ ❌", details: err });
    }
    res.status(201).json({ message: "ເພີ່ມນັດໝາຍສຳເລັດ ✅", appoint_id: appoint_id });
  });
});


// ✅ ดึงนัดหมายทั้งหมด
router.get("/appointment", (req, res) => {
    const query = "SELECT * FROM tbappointment";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນນັດໝາຍ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນນັດໝາຍສຳເລັດ ✅", data: results });
    });
});

// ✅ ดึงนัดหมายทั้งหมด
router.get("/appointmentWang", (req, res) => {
    const query = "SELECT * FROM tbappointment WHERE status = 'ລໍຖ້າ' AND DATE(date_addmintted) = CURDATE()";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນນັດໝາຍ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນນັດໝາຍສຳເລັດ ✅", data: results });
    });
});

// ✅ ดึงนัดหมายตาม appoint_id
router.get("/appointment/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbappointment WHERE appoint_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນນັດໝາຍ ❌", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ສະແດງນັດໝາຍສຳເລັດ ✅", data: results[0] });
    });
});

router.put("/appointment/:id", (req, res) => {
    const { id } = req.params;
    const { date_addmintted, status, description, emp_id, patient_id } = req.body;

    const query = `
        UPDATE tbappointment
        SET date_addmintted = ?, status = ?, description = ?, emp_id = ?, patient_id = ?
        WHERE appoint_id = ?
    `;

    db.query(query, [date_addmintted, status, description, emp_id, patient_id, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂນັດໝາຍ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂນັດໝາຍສຳເລັດ ✅" });
    });
});

// เพิ่ม endpoint สำหรับดึงรหัสล่าสุดของบริการทั่วไป (NOT PACKAGE)
router.get("/next-appointment-id", (req, res) => {
    const query = `
        SELECT appoint_id FROM tbappointment WHERE appoint_id LIKE 'AP%' ORDER BY appoint_id DESC LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດ ❌", details: err });
        }
        
        let nextId = "AP0001"; // รหัสเริ่มต้น
        
        if (results.length > 0) {
            const lastId = results[0].appoint_id;
            const lastNumber = parseInt(lastId.substring(2));
            const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
            nextId = `AP${nextNumber}`;
        }
        
        res.status(200).json({ 
            message: "ດຶງລະຫັດຖັດໄປສຳເລັດ ✅", 
            nextId: nextId 
        });
    });
});

router.put("/appointmentS/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const query = `
        UPDATE tbappointment
        SET  status = ?
        WHERE appoint_id = ?
    `;

    db.query(query, [status, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂນັດໝາຍ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂນັດໝາຍສຳເລັດ ✅" });
    });
});

router.put("/appointmentD/:id", (req, res) => {
    const { id } = req.params;
    const { date_addmintted } = req.body;

    const query = `
        UPDATE tbappointment
        SET  date_addmintted = ?
        WHERE appoint_id = ?
    `;

    db.query(query, [date_addmintted, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂນັດໝາຍ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂນັດໝາຍສຳເລັດ ✅" });
    });
});


// ✅ ลบนัดหมาย
router.delete("/appointment/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM tbappointment WHERE appoint_id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລຶບນັດໝາຍ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ລຶບນັດໝາຍສຳເລັດ ✅" });
    });
});



module.exports = router;
