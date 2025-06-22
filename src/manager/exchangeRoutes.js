const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/exchange", (req, res) => {
    const { ex_id, ex_type, ex_rate } = req.body;

    const query = `
        INSERT INTO tbexchange (ex_id, ex_type, ex_rate, ex_date)
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [ex_id, ex_type, ex_rate, ex_date], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນອັດຕາແລກປ່ຽນ ❌", details: err });
        }
        res.status(201).json({ message: "ເພີ່ມຂໍ້ມູນສຳເລັດ ✅", ex_id: result.insertId });
    });
});


router.get("/exchange", (req, res) => {
    const query = "SELECT * FROM tbexchange";

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນອັດຕາແລກປ່ຽນ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນສຳເລັດ ✅", data: results });
    });
});

router.get("/today/:date", (req, res) => {
  const date = req.params.date; // <--- ได้ค่า '2025-06-21' เป็น string ธรรมดา

  const query = `SELECT * FROM tbexchange WHERE ex_date = ?`;
  db.query(query, [date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: results });
  });
});


// เพิ่ม endpoint สำหรับดึงรหัสล่าสุดของบริการทั่วไป (NOT PACKAGE)
router.get("/next-exchange-id", (req, res) => {
    const query = `
        SELECT ex_id FROM tbexchange WHERE ex_id LIKE 'E%' ORDER BY ex_id DESC LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດ ❌", details: err });
        }
        
        let nextId = "E01"; // รหัสเริ่มต้น
        
        if (results.length > 0) {
            const lastId = results[0].ex_id;
            const lastNumber = parseInt(lastId.substring(1));
            const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
            nextId = `E${nextNumber}`;
        }
        
        res.status(200).json({ 
            message: "ດຶງລະຫັດຖັດໄປສຳເລັດ ✅", 
            nextId: nextId 
        });
    });
});

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
router.put("/exchange/:id", (req, res) => {
    const { id } = req.params;
    const { ex_type, ex_rate } = req.body;

    const query = `
        UPDATE tbexchange
        SET ex_type = ?, ex_rate = ?, ex_date = ?
        WHERE ex_id = ?
    `;

    db.query(query, [ex_type, ex_rate, ex_date, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນສຳເລັດ ✅" });
    });
});

router.post('/update-rates', (req, res) => {
  const { rates } = req.body;
  const today = new Date().toISOString().split('T')[0];

  // ฟังก์ชันอัปเดตแต่ละตัว โดยใช้ Promise เพื่อให้รอทุกตัวอัปเดตก่อนส่ง response
  const updateOne = (ex_type, ex_rate) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT ex_id FROM tbexchange WHERE ex_type = ? ORDER BY ex_date DESC LIMIT 1`,
        [ex_type],
        (err, rows) => {
          if (err) return reject(err);
          if (!rows.length) return reject(new Error(`ไม่พบ ex_id สำหรับ ${ex_type}`));
          const ex_id = rows[0].ex_id;

          db.query(
            `UPDATE tbexchange SET ex_rate = ?, ex_date = ? WHERE ex_id = ?`,
            [ex_rate, today, ex_id],
            (err2, result) => {
              if (err2) return reject(err2);
              resolve(result);
            }
          );
        }
      );
    });
  };

  // ใช้ Promise.all เพื่อรออัปเดตครบทุกตัว
  Promise.all(
    rates.map(({ ex_type, ex_rate }) => updateOne(ex_type, ex_rate))
  )
    .then(() => {
      res.json({ message: 'อัปเดตอัตราแลกเปลี่ยนสำเร็จ' });
    })
    .catch((error) => {
      console.error('❌ Error updating rates:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดขณะอัปเดต' });
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
