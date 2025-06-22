const express = require("express");
const router = express.Router();
const db = require("../../db");



// GET - ดึง packetdetail ทั้งหมด
router.get("/packet-detail", (req, res) => {
  const query = `SELECT * FROM tbpacket_detail`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        error: "ไม่สามารถดึงข้อมูล packetdetail ทั้งหมดได้",
        details: err 
      });
    }
    res.status(200).json({ 
      message: "ดึงข้อมูล packetdetail ทั้งหมดสำเร็จ",
      data: results 
    });
  });
});

// GET - ดึง packetdetail ตาม ser_id
router.get("/packet-detail/:ser_id", (req, res) => {
  const { ser_id } = req.params;

  const query = `SELECT * FROM tbpacket_detail WHERE ser_id = ? ORDER BY packetdetail_id`;

  db.query(query, [ser_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        error: "ไม่สามารถดึง packetdetail สำหรับ ser_id ที่ระบุได้",
        details: err 
      });
    }
    res.status(200).json({ 
      message: "ดึง packetdetail สำหรับ ser_id ที่ระบุสำเร็จ",
      data: results 
    });
  });
});

// ✅ GET - เช็คว่ายามีอยู่ในชุดแล้วหรือไม่
router.get("/check-medicine-in-packet/:ser_id/:med_id", (req, res) => {
  const { ser_id, med_id } = req.params;

  const query = `
    SELECT packetdetail_id, qty 
    FROM tbpacket_detail 
    WHERE ser_id = ? AND med_id = ?
  `;

  db.query(query, [ser_id, med_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        error: "ไม่สามารถเช็คข้อมูลยาได้",
        details: err 
      });
    }

    if (results.length > 0) {
      // ยามีอยู่แล้ว
      res.status(200).json({ 
        exists: true,
        data: results[0] // { packetdetail_id, qty }
      });
    } else {
      // ยาไม่มีในชุด
      res.status(200).json({ 
        exists: false,
        data: null
      });
    }
  });
});

// POST - เพิ่ม packetdetail (ปรับปรุงใหม่)
router.post("/packet-detail", (req, res) => {
  const { ser_id, med_id, qty } = req.body;

  // ✅ Validation
  if (!ser_id || !med_id || !qty) {
    return res.status(400).json({ 
      error: "ข้อมูลไม่ครบถ้วน: ser_id, med_id, qty จำเป็นต้องมี" 
    });
  }

  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ 
      error: "qty ต้องเป็นตัวเลขและมากกว่า 0" 
    });
  }

  // ✅ ใช้ auto-increment แทนการสร้าง ID เอง
  const query = `
    INSERT INTO tbpacket_detail (ser_id, med_id, qty) 
    VALUES (?, ?, ?)
  `;

  db.query(query, [ser_id, med_id, qty], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      
      // ✅ จัดการ error แบบละเอียด
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
          error: "ข้อมูลซ้ำ: ยานี้มีอยู่ในชุดแล้ว",
          details: err.message
        });
      }
      
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          error: "ข้อมูลอ้างอิงไม่ถูกต้อง: ser_id หรือ med_id ไม่มีอยู่",
          details: err.message
        });
      }
      
      return res.status(500).json({ 
        error: "ไม่สามารถเพิ่ม packetdetail ได้",
        details: err.message
      });
    }

    // ✅ ส่ง ID ที่สร้างใหม่กลับไป
    res.status(201).json({ 
      message: "เพิ่ม packetdetail สำเร็จ ✅",
      packetdetail_id: result.insertId,
      affectedRows: result.affectedRows
    });
  });
});

// ✅ PUT - แก้ไข/เพิ่มจำนวนยาในชุด
router.put("/packet-detail/:packetdetail_id", (req, res) => {
  const { packetdetail_id } = req.params;
  const { qty, action } = req.body; // action: 'update' หรือ 'add'

  // Validation
  if (!packetdetail_id || isNaN(packetdetail_id)) {
    return res.status(400).json({ 
      error: "packetdetail_id ต้องเป็นตัวเลข" 
    });
  }

  if (!qty || isNaN(qty) || qty <= 0) {
    return res.status(400).json({ 
      error: "qty ต้องเป็นตัวเลขและมากกว่า 0" 
    });
  }

  let query;
  let params;

  if (action === 'add') {
    // เพิ่มจำนวนเข้าไปในจำนวนเดิม
    query = `
      UPDATE tbpacket_detail 
      SET qty = qty + ? 
      WHERE packetdetail_id = ?
    `;
    params = [parseInt(qty), parseInt(packetdetail_id)];
  } else {
    // แทนที่จำนวนเดิม (update)
    query = `
      UPDATE tbpacket_detail 
      SET qty = ? 
      WHERE packetdetail_id = ?
    `;
    params = [parseInt(qty), parseInt(packetdetail_id)];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        error: "ไม่สามารถแก้ไข packetdetail ได้", 
        details: err 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: "ไม่พบ packetdetail ที่ต้องการแก้ไข",
        packetdetail_id 
      });
    }

    // ดึงข้อมูลที่อัพเดทแล้วมาแสดง
    const selectQuery = `SELECT * FROM tbpacket_detail WHERE packetdetail_id = ?`;
    db.query(selectQuery, [parseInt(packetdetail_id)], (selectErr, selectResult) => {
      if (selectErr) {
        console.error("Select error:", selectErr);
        return res.status(200).json({ 
          message: `${action === 'add' ? 'เพิ่ม' : 'แก้ไข'}จำนวนยาสำเร็จ ✅`,
          packetdetail_id: parseInt(packetdetail_id),
          affectedRows: result.affectedRows
        });
      }

      res.status(200).json({ 
        message: `${action === 'add' ? 'เพิ่ม' : 'แก้ไข'}จำนวนยาสำเร็จ ✅`,
        packetdetail_id: parseInt(packetdetail_id),
        affectedRows: result.affectedRows,
        updatedData: selectResult[0]
      });
    });
  });
});

// DELETE - ลบ packetdetail โดย packetdetail_id
router.delete("/packet-detail/:packetdetail_id", (req, res) => {
  const { packetdetail_id } = req.params;

  if (!packetdetail_id || isNaN(packetdetail_id)) {
    return res.status(400).json({ 
      error: "packetdetail_id ต้องเป็นตัวเลข" 
    });
  }

  const query = `DELETE FROM tbpacket_detail WHERE packetdetail_id = ?`;

  db.query(query, [parseInt(packetdetail_id)], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        error: "ไม่สามารถลบ packetdetail ได้", 
        details: err 
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: "ไม่พบ packetdetail ที่ต้องการลบ",
        packetdetail_id 
      });
    }
    res.status(200).json({ 
      message: "ลบ packetdetail สำเร็จ ✅",
      packetdetail_id: parseInt(packetdetail_id),
      affectedRows: result.affectedRows
    });
  });
});

module.exports = router;