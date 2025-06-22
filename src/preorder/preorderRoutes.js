
const express = require("express");
const router = express.Router();
const db = require("../../db");

/// POST
router.post("/preorder", (req, res) => {
  const { preorder_id, preorder_date, status, sup_id, emp_id_create } = req.body;

  const query = `
    INSERT INTO tbpreorder (preorder_id, preorder_date, status, sup_id, emp_id_create)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [preorder_id, preorder_date, status, sup_id, emp_id_create], (err) => {
    if (err) return res.status(500).json({ error: "Insert preorder failed", details: err });
    res.status(200).json({ message: "Insert preorder success ✅" });
  });
});

// GET: ทั้งหมด
router.get("/preorder", (req, res) => {
  db.query("SELECT * FROM tbpreorder", (err, results) => {
    if (err) return res.status(500).json({ error: "Get preorder failed", details: err });
    res.status(200).json({ data: results });
  });
});

// เพิ่ม endpoint สำหรับดึงรหัสล่าสุดของบริการทั่วไป (NOT PACKAGE)
router.get("/next-preorder-id", (req, res) => {
    const query = `
        SELECT preorder_id FROM tbpreorder WHERE preorder_id LIKE 'PE%' ORDER BY preorder_id DESC LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດ ❌", details: err });
        }
        
        let nextId = "PE001"; // รหัสเริ่มต้น
        
        if (results.length > 0) {
            const lastId = results[0].preorder_id;
            const lastNumber = parseInt(lastId.substring(2));
            const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
            nextId = `PE${nextNumber}`;
        }
        
        res.status(200).json({ 
            message: "ດຶງລະຫັດຖັດໄປສຳເລັດ ✅", 
            nextId: nextId 
        });
    });
});

// GET: รายการเดียว
router.get("/preorder/:id", (req, res) => {
  db.query("SELECT * FROM tbpreorder WHERE preorder_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Get single preorder failed", details: err });
    if (results.length === 0) return res.status(404).json({ message: "Preorder not found" });
    res.status(200).json({ data: results[0] });
  });
});


// แก้ไขข้อมูลสั่งซื้อ
router.put("/preorder/:id", (req, res) => {
  const { id } = req.params; // ดึง id จาก URL
  const { preorder_date, sup_id, emp_id_create } = req.body; // ดึงข้อมูลจาก body

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!preorder_date || !sup_id || !emp_id_create) {
    return res.status(400).json({
      error: "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ",
      required: ["preorder_date", "sup_id", "emp_id_create"]
    });
  }

  const query = `
        UPDATE tbpreorder 
        SET preorder_date = ?, sup_id = ?, emp_id_create = ? 
        WHERE preorder_id = ?;
    `;

  db.query(query, [preorder_date, sup_id, emp_id_create, id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນສັ່ງຊື້ ❌",
        details: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນສັ່ງຊື້ຢານີ້"
      });
    }

    res.status(200).json({
      message: "ແກ້ໄຂຂໍ້ມູນສັ່ງຊື້ສຳເລັດ ✅",
      affectedRows: result.affectedRows
    });
  });
});

// DELETE
router.delete("/preorder/:id", (req, res) => {
  db.query("DELETE FROM tbpreorder WHERE preorder_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete preorder failed", details: err });
    res.status(200).json({ message: "Delete preorder success ✅" });
  });
});

module.exports = router;




