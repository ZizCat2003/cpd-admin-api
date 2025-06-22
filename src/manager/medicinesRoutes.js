// medicinesRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../db");

// ฟังก์ชันสำหรับตรวจสอบและอัพเดทสถานะยาอัตโนมัติ
const updateMedicineStatus = (qty) => {
  if (qty <= 0) {
    return 'ໝົດ';
  } else if (qty <= 20) {
    return 'ໃກ້ໝົດ';
  } else {
    return 'ຍັງມີ';
  }
};

// ฟังก์ชันสำหรับอัพเดทสถานะในฐานข้อมูล
const updateStatusInDatabase = (callback) => {
  const selectQuery = "SELECT med_id, qty, status FROM tbmedicines";
  
  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error selecting medicines for status update:', err);
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, { updated: 0, message: 'ບໍ່ມີຂໍ້ມູນຢາທີ່ຕ້ອງອັບເດດ' });
    }

    // หารายการที่ต้องอัพเดท
    const needsUpdate = results.filter(medicine => {
      const correctStatus = updateMedicineStatus(medicine.qty);
      return medicine.status !== correctStatus;
    });

    if (needsUpdate.length === 0) {
      return callback(null, { updated: 0, message: 'ສະຖານະຢາທັງໝົດຖືກຕ້ອງແລ້ວ' });
    }

    // อัพเดททีละรายการ
    let updateCount = 0;
    let errors = [];

    needsUpdate.forEach((medicine, index) => {
      const newStatus = updateMedicineStatus(medicine.qty);
      const updateQuery = "UPDATE tbmedicines SET status = ? WHERE med_id = ?";
      
      db.query(updateQuery, [newStatus, medicine.med_id], (updateErr, updateResult) => {
        if (updateErr) {
          errors.push({ med_id: medicine.med_id, error: updateErr.message });
        } else {
          updateCount++;
          console.log(`Updated ${medicine.med_id}: ${medicine.status} -> ${newStatus}`);
        }

        // ตรวจสอบว่าทำงานครบแล้วหรือยัง
        if (index === needsUpdate.length - 1) {
          if (errors.length > 0) {
            callback(errors, { updated: updateCount, total: needsUpdate.length });
          } else {
            callback(null, { updated: updateCount, total: needsUpdate.length });
          }
        }
      });
    });
  });
};

// ✅ ดึงนัดหมายตาม appoint_id
router.get("/medicinesWang", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbmedicines WHERE status IN ('ໃກ້ໝົດ', 'ໝົດ')";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນຢາ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນຢາສຳເລັດ ✅", data: results });
    });
});


// GET all medicines with auto status update
router.get("/medicines", (req, res) => {
  // อัพเดทสถานะในฐานข้อมูลก่อน
  updateStatusInDatabase((updateErr, updateResult) => {
    if (updateErr) {
    } else {

    }

    // ดึงข้อมูลจากฐานข้อมูล
    const query = "SELECT * FROM tbmedicines ORDER BY med_id ASC";
    db.query(query, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນຢາ ❌", details: err });
      }
      
      res.status(200).json({ 
        message: "ສະແດງຂໍ້ມູນຢາສຳເລັດ ✅", 
        data: results,
        statusUpdateInfo: updateResult
      });
    });
  });
});

// medicinesRoutes.js - แก้ไข GET medicines by ID
router.get("/medicines/:id", (req, res) => {
  const { id } = req.params;


  try {
    // อัพเดทสถานะในฐานข้อมูลก่อน
    updateStatusInDatabase((updateErr, updateResult) => {
      if (updateErr) {

      }

      // แก้ไข: ใช้ med_id โดยตรง ไม่ต้อง convert หรือเปลี่ยนแปลง
      let query = `SELECT * FROM tbmedicines WHERE med_id = ?`;

      db.query(query, [id], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ 
            error: "Database error", 
            details: err.message 
          });
        }      
        
        if (results.length === 0) {
          return res.status(404).json({ 
            message: "Medicine not found",
            searchedId: id 
          });
        }
        
        // ส่งข้อมูลยาเดียว (ไม่ใช่ array)
        res.status(200).json({ 
          resultCode: "200", 
          message: "Query Success", 
          data: results[0] // ส่งแค่ object เดียว
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "API Error",
      error: error.message,
    });
  }
});

// เพิ่ม endpoint สำหรับดึงรหัสล่าสุดของยา
router.get("/next-medicines-id", (req, res) => {
    const query = `
        SELECT med_id FROM tbmedicines WHERE med_id LIKE 'M%' ORDER BY med_id DESC LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດ ❌", details: err });
        }
        
        let nextId = "M01"; // รหัสเริ่มต้น
        
        if (results.length > 0) {
            const lastId = results[0].med_id;
            const lastNumber = parseInt(lastId.substring(1));
            const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
            nextId = `M${nextNumber}`;
        }
        
        res.status(200).json({ 
            message: "ດຶງລະຫັດຖັດໄປສຳເລັດ ✅", 
            nextId: nextId 
        });
    });
});

// POST new medicine with auto status
router.post("/medicines", (req, res) => {
  const {
    med_id,
    med_name,
    qty,

    unit,
    price,
    expired,
    medtype_id,
    emp_id_create,
    created_at,
  } = req.body;

  // คำนวณสถานะอัตโนมัติ
  const autoStatus = updateMedicineStatus(qty);

  const query = `
        INSERT INTO tbmedicines (
            med_id, med_name, qty, status, unit, price, expired,
            medtype_id, emp_id_create, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  console.log('Request body:', req.body);
  console.log('Auto calculated status:', autoStatus);

  db.query(
    query,
    [
      med_id,
      med_name,
      qty,
      autoStatus,
      unit,
      price,
      expired,
      medtype_id,
      emp_id_create,
      created_at,
    ],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res
          .status(500)
          .json({ 
            error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນຢາໄດ້ ❌", 
            details: err.message,
            sqlError: err.code 
          });
      }
      
      console.log('Insert result:', result);
      res
        .status(201)
        .json({ 
          message: "ເພີ່ມຂໍ້ມູນຢາສຳເລັດ ✅", 
          med_id: result.insertId,
          status: autoStatus,
          data: result
        });
    }
  );
});

// PUT update medicine with auto status
router.put("/medicines/:id", (req, res) => {
  const { id } = req.params;
  const {
    med_name,
    qty,

    unit,
    price,
    expired,
    medtype_id,
    emp_id_create,
    created_at,
  } = req.body;

  // คำนวณสถานะอัตโนมัติ
  const autoStatus = updateMedicineStatus(qty);

  const query = `
        UPDATE tbmedicines
        SET med_name = ?, qty = ?, status = ?, unit = ?, price = ?, expired = ?,
            medtype_id = ?, emp_id_create = ?, created_at = ?
        WHERE med_id = ?
    `;

  console.log('Auto calculated status for update:', autoStatus);

  db.query(
    query,
    [
      med_name,
      qty,
      autoStatus,
      unit,
      price,
      expired,
      medtype_id,
      emp_id_create,
      created_at,
      id,
    ],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນຢາ ❌", details: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນຢານີ້" });
      }
      res.status(200).json({ 
        message: "ແກ້ໄຂຂໍ້ມູນຢາສຳເລັດ ✅",
        status: autoStatus
      });
    }
  );
});

// DELETE medicine
router.delete("/medicines/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM tbmedicines WHERE med_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: "ບໍ່ສາມາດລຶບຂໍ້ມູນຢາ ❌",
        details: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນຢານີ້" });
    }

    res.status(200).json({ message: "ລຶບຂໍ້ມູນຢາສຳເລັດ ✅" });
  });
});

// endpoint สำหรับอัพเดทสถานะยาทั้งหมดในฐานข้อมูลแบบ manual
router.put("/medicines-bulk-status-update", (req, res) => {
  updateStatusInDatabase((err, result) => {
    if (err) {
      return res.status(500).json({
        error: "ບໍ່ສາມາດອັບເດດສະຖານະຢາ ❌",
        details: err
      });
    }

    res.status(200).json({
      message: `ອັບເດດສະຖານະຢາສຳເລັດ ✅`,
      ...result
    });
  });
});




module.exports = router;
