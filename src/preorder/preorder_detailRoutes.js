const express = require("express");
const router = express.Router();
const db = require("../../db");


// ✅ เพิ่ม route ใหม่ใน router
// GET - ดึง detail_id ล่าสุดจากฐานข้อมูล
router.get("/get-last-detail-id", (req, res) => {
  const query = `
    SELECT MAX(detail_id) as lastDetailId 
    FROM tbpreorder_detail
  `;

  db.query(query, (err, results) => {
    if (err) {
  
      return res.status(500).json({ 
        error: "ไม่สามารถดึงข้อมูล detail_id ล่าสุดได้", 
        details: err 
      });
    }

    // ถ้าไม่มีข้อมูลในตาราง ให้ return 0
    const lastDetailId = results[0]?.lastDetailId || 0;
   
    res.status(200).json({ 
      lastDetailId: lastDetailId,
      nextDetailId: lastDetailId + 1
    });
  });
});

// POST
router.post("/preorder-detail", (req, res) => {
  const { detail_id, preorder_id, med_id, qty } = req.body;

  const query = `
    INSERT INTO tbpreorder_detail (detail_id, preorder_id, med_id, qty)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [detail_id, preorder_id, med_id, qty], (err) => {
    if (err) return res.status(500).json({ error: "Insert detail failed", details: err });
    res.status(200).json({ message: "Insert detail success ✅" });
  });
});

// ดึงรายละเอียดสั่งซื้อตาม preorder_id
router.get("/preorder-detail/:preorder_id", (req, res) => {
  const { preorder_id } = req.params;

  const query = `
    SELECT 
      p.detail_id,
      p.preorder_id,
      p.med_id,
      p.qty,
      m.med_name,
      t.type_name,
      m.unit
    FROM tbpreorder_detail p
    JOIN tbmedicines m ON p.med_id = m.med_id
    JOIN tbmedicinestype t ON m.medtype_id = t.medtype_id
    WHERE p.preorder_id = ?
    ORDER BY p.detail_id
  `;

  db.query(query, [preorder_id], (err, results) => {
    if (err) {

      return res.status(500).json({
        error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍລະອຽດສັ່ງຊື້ໄດ້",
        details: err.message,
      });
    }

    res.status(200).json({
      message: "ດຶງຂໍ້ມູນລາຍລະອຽດສັ່ງຊື້ສຳເລັດ",
      data: results,
    });
  });
});


// ดึงรายละเอียดสั่งซื้อตาม preorder_id
router.get("/preorder-detail", (req, res) => {
  const query = `
    SELECT *FROM tbpreorder_detail
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍລະອຽດສັ່ງຊື້ໄດ້",
        details: err.message
      });
    }

    res.status(200).json({
      message: "ດຶງຂໍ້ມູນລາຍລະອຽດສັ່ງຊື້ສຳເລັດ",
      data: results
    });
  });
});

// API สำหรับแก้ไขรายละเอียดสั่งซื้อ
router.put("/preorder-detail/:detail_id", (req, res) => {
  const { detail_id } = req.params;
  const { qty } = req.body;

  // ตรวจสอบว่ามีการส่ง qty มาหรือไม่
  if (!qty || qty <= 0) {
    return res.status(400).json({ 
      error: "ຈຳນວນຕ້ອງມາກກວ່າ 0", 
      details: "Quantity must be greater than 0" 
    });
  }

  // ตรวจสอบว่า detail_id มีอยู่ในฐานข้อมูลหรือไม่
  const checkQuery = `
    SELECT detail_id FROM tbpreorder_detail 
    WHERE detail_id = ?
  `;

  db.query(checkQuery, [detail_id], (err, results) => {
    if (err) {
      console.error("Error checking detail_id:", err);
      return res.status(500).json({ 
        error: "ການກວດສອບຂໍ້ມູນລົ້ມເຫລວ", 
        details: err 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        error: "ບໍ່ພົບລາຍລະອຽດທີ່ຕ້ອງການແກ້ໄຂ", 
        details: "Detail not found" 
      });
    }

    // อัปเดตจำนวนในฐานข้อมูล
    const updateQuery = `
      UPDATE tbpreorder_detail 
      SET qty = ?
      WHERE detail_id = ?
    `;

    db.query(updateQuery, [qty, detail_id], (err, result) => {
      if (err) {
        console.error("Error updating detail:", err);
        return res.status(500).json({ 
          error: "ການແກ້ໄຂຂໍ້ມູນລົ້ມເຫລວ", 
          details: err 
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້", 
          details: "No rows affected" 
        });
      }

      res.status(200).json({ 
        message: "ແກ້ໄຂຂໍ້ມູນສຳເລັດ ✅",
        detail_id: detail_id,
        new_qty: qty,
        affected_rows: result.affectedRows
      });
    });
  });
});

// ✅ เพิ่ม DELETE route สำหรับลบ detail ตาม detail_id
router.delete("/preorder-detail/:detail_id", (req, res) => {
  const { detail_id } = req.params;

  console.log('Attempting to delete detail_id:', detail_id);

  // ตรวจสอบว่า detail_id เป็นตัวเลข
  if (!detail_id || isNaN(detail_id)) {
    return res.status(400).json({ 
      error: "detail_id ต้องเป็นตัวเลข" 
    });
  }

  // ลบข้อมูลจากฐานข้อมูล
  const query = `
    DELETE FROM tbpreorder_detail 
    WHERE detail_id = ?
  `;

  db.query(query, [parseInt(detail_id)], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        error: "Delete detail failed", 
        details: err 
      });
    }

    // ตรวจสอบว่ามีการลบข้อมูลจริงหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: "ไม่พบข้อมูลที่ต้องการลบ",
        detail_id: detail_id
      });
    }

    console.log(`Successfully deleted detail_id: ${detail_id}, affected rows: ${result.affectedRows}`);
    
    res.status(200).json({ 
      message: "Delete detail success ✅",
      detail_id: parseInt(detail_id),
      affectedRows: result.affectedRows
    });
  });
});

module.exports = router;
