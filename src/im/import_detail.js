const express = require("express");
const router = express.Router();
const db = require("../../db");

// ✅ เพิ่ม route ใหม่ใน router
// GET - ดึง detail_id ล่าสุดจากฐานข้อมูล
router.get("/get-last-detail-id", (req, res) => {
  const query = `
    SELECT MAX(detail_id) as lastDetailId 
    FROM tbimport_detail
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
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

// POST - เพิ่มข้อมูล import detail และอัปเดตจำนวนยา
router.post("/import-detail", (req, res) => {
  const { detail_id, im_id, med_id, qty, expired_date } = req.body;

  // เริ่ม transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Transaction failed", details: err });
    }

    // 1. เพิ่มข้อมูลใน tbimport_detail
    const insertQuery = `
      INSERT INTO tbimport_detail (detail_id, im_id, med_id, qty, expired_date)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [detail_id, im_id, med_id, qty, expired_date], (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: "Insert import detail failed", details: err });
        });
      }

      // 2. อัปเดตจำนวนยาในตารางยา (สมมติว่าตารางยาชื่อ tbmedicine)
      const updateMedicineQuery = `
        UPDATE tbmedicines 
        SET qty = qty + ? 
        WHERE med_id = ?
      `;

      db.query(updateMedicineQuery, [qty, med_id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: "Update medicine quantity failed", details: err });
          });
        }

        // ตรวจสอบว่ามียาตัวนี้ในระบบหรือไม่
        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ error: "ไม่พบยาที่ต้องการอัปเดต", med_id: med_id });
          });
        }

        // Commit transaction ถ้าทุกอย่างสำเร็จ
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: "Transaction commit failed", details: err });
            });
          }

          res.status(200).json({ 
            message: "Import detail และอัปเดตจำนวนยาสำเร็จ ✅",
            detail_id: detail_id,
            med_id: med_id,
            added_qty: qty
          });
        });
      });
    });
  });
});

// ✅ PUT - อัปเดต import detail และปรับจำนวนยา
router.put("/import-detail/:detail_id", (req, res) => {
  const { detail_id } = req.params;
  const { qty: new_qty, expired_date } = req.body;

  // เริ่ม transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Transaction failed", details: err });
    }

    // 1. ดึงข้อมูลเก่าก่อน
    const getOldDataQuery = `
      SELECT med_id, qty as old_qty 
      FROM tbimport_detail 
      WHERE detail_id = ?
    `;

    db.query(getOldDataQuery, [detail_id], (err, results) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: "Get old data failed", details: err });
        });
      }

      if (results.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ error: "ไม่พบข้อมูล import detail" });
        });
      }

      const { med_id, old_qty } = results[0];
      const qty_difference = new_qty - old_qty;

      // 2. อัปเดต import detail
      const updateDetailQuery = `
        UPDATE tbimport_detail 
        SET qty = ?, expired_date = ?
        WHERE detail_id = ?
      `;

      db.query(updateDetailQuery, [new_qty, expired_date, detail_id], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: "Update import detail failed", details: err });
          });
        }

        // 3. ปรับจำนวนยาตามผลต่าง
        const updateMedicineQuery = `
          UPDATE tbmedicines 
          SET qty = qty + ? 
          WHERE med_id = ?
        `;

        db.query(updateMedicineQuery, [qty_difference, med_id], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: "Update medicine qty failed", details: err });
            });
          }

          // Commit transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: "Transaction commit failed", details: err });
              });
            }

            res.status(200).json({ 
              message: "อัปเดต import detail และจำนวนยาสำเร็จ ✅",
              detail_id: detail_id,
              old_qty: old_qty,
              new_qty: new_qty,
              qty_difference: qty_difference
            });
          });
        });
      });
    });
  });
});


// ดึงรายละเอียดนำเข้าตาม im_id
router.get("/import-detail/:im_id", (req, res) => {
  const { im_id } = req.params;

    const query = `
    SELECT 
      d.detail_id,
      d.im_id,
      d.med_id,
      m.med_name,
      t.type_name,
      d.expired_date,
      d.qty
    FROM tbimport_detail d
    JOIN tbmedicines m ON d.med_id = m.med_id
    JOIN tbmedicinestype t ON m.medtype_id = t.medtype_id
    WHERE d.im_id = ?
  `;


  db.query(query, [im_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍລະອຽດນຳເຂົ້າໄດ້",
        details: err.message
      });
    }

    res.status(200).json({
      message: "ດຶງຂໍ້ມູນລາຍລະອຽດນຳເຂົ້າສຳເລັດ",
      data: results
    });
  });
});

// ดึงรายละเอียดนำเข้าทั้งหมด
router.get("/import-detail", (req, res) => {
  const query = `
    SELECT * FROM tbimport_detail
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍລະອຽດນຳເຂົ້າໄດ້",
        details: err.message
      });
    }

    res.status(200).json({
      message: "ດຶງຂໍ້ມູນລາຍລະອຽດນຳເຂົ້າສຳເລັດ",
      data: results
    });
  });
});


// ✅ DELETE - ลบ import detail และลดจำนวนยา
router.delete("/import-detail/:detail_id", (req, res) => {
  const { detail_id } = req.params;

  console.log('Attempting to delete detail_id:', detail_id);

  // ตรวจสอบว่า detail_id เป็นตัวเลข
  if (!detail_id || isNaN(detail_id)) {
    return res.status(400).json({ 
      error: "detail_id ต้องเป็นตัวเลข" 
    });
  }

  // เริ่ม transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Transaction failed", details: err });
    }

    // 1. ดึงข้อมูลก่อนลบ
    const getDataQuery = `
      SELECT med_id, qty 
      FROM tbimport_detail 
      WHERE detail_id = ?
    `;

    db.query(getDataQuery, [parseInt(detail_id)], (err, results) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: "Get data failed", details: err });
        });
      }

      if (results.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ 
            error: "ไม่พบข้อมูลที่ต้องการลบ",
            detail_id: detail_id
          });
        });
      }

      const { med_id, qty } = results[0];

      // 2. ลบข้อมูลจาก tbimport_detail
      const deleteQuery = `
        DELETE FROM tbimport_detail 
        WHERE detail_id = ?
      `;

      db.query(deleteQuery, [parseInt(detail_id)], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: "Delete import detail failed", details: err });
          });
        }

        // 3. ลดจำนวนยาในตารางยา
        const updateMedicineQuery = `
          UPDATE tbmedicines 
          SET qty = qty - ? 
          WHERE med_id = ?
        `;

        db.query(updateMedicineQuery, [qty, med_id], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: "Update medicine quantity failed", details: err });
            });
          }

          // Commit transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: "Transaction commit failed", details: err });
              });
            }

            console.log(`Successfully deleted detail_id: ${detail_id}, reduced medicine qty: ${qty}`);
            
            res.status(200).json({ 
              message: "Delete import detail และปรับจำนวนยาสำเร็จ ✅",
              detail_id: parseInt(detail_id),
              med_id: med_id,
              reduced_qty: qty,
              affectedRows: result.affectedRows
            });
          });
        });
      });
    });
  });
});

module.exports = router;