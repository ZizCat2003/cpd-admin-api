const express = require("express");
const router = express.Router();
const db = require("../../db");
const multer = require("multer");

const path = require("path");
const fs = require("fs");

// ✅ สร้างโฟลเดอร์ upload_file_import ถ้ายังไม่มี
const uploadDir = path.join(__dirname, "../../public/upload_file_import");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ ตั้งค่า multer สำหรับการอัพโลดไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // ใช้ timestamp + original name เพื่อหลีกเลี่ยงชื่อซ้ำ
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

// ✅ ตั้งค่าขีดจำกัดและประเภทไฟล์ที่อนุญาต
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // จำกัด 10MB
  },
  fileFilter: function (req, file, cb) {
    // อนุญาตเฉพาะไฟล์ประเภทเอกสาร
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('ປະເພດຟາຍບໍ່ໄດ້ຮັບອະນຸຍາດ'), false);
    }
  }
});

// ✅ POST - สร้าง import ใหม่ (รองรับการอัพโลดไฟล์)
router.post("/import", upload.single('file'), (req, res) => {
  try {
    const { im_id, im_date, preorder_id, emp_id, note } = req.body;
    
    let fileName = null;
    if (req.file) {
      fileName = req.file.filename;
    }

    if (!im_id || !im_date || !emp_id ) {
      return res.status(400).json({ 
        error: "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ", 
        message: "ກະລຸນາເລືອກ im_id, im_date ແລະ emp_id" 
      });
    }

    const query = `
      INSERT INTO tbimport (im_id, im_date, preorder_id, file, emp_id_create, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [im_id, im_date, preorder_id || null, fileName, emp_id, note], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        
        // ✅ ลบไฟล์ที่อัพโลดแล้วถ้าเกิดข้อผิดพลาดในฐานข้อมูล
        if (fileName) {
          const filePath = path.join(uploadDir, fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }      
        return res.status(500).json({ 
          error: "Insert import failed", 
          details: err.message 
        });
      }
      if (preorder_id) {
        const updateStatusQuery = 'UPDATE tbpreorder SET status = ? WHERE preorder_id = ?';
        db.query(updateStatusQuery, ['SUCCESS', preorder_id]);
    }
      
      res.status(200).json({ 
        message: "Insert import SUCCESS ✅",
        data: {
          im_id,
          im_date,
          preorder_id: preorder_id || null,
          file: fileName,
          emp_id_create: emp_id,
          note
        }
      });
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      error: "Server error", 
      details: error.message 
    });
  }
});

// ✅ GET - รับข้อมูล import ทั้งหมด
router.get("/import", (req, res) => {
  const query = `
    SELECT 
  i.im_id,
  i.im_date,
  i.preorder_id,
  i.file,
  i.emp_id_create,
  i.note,
  GROUP_CONCAT(DISTINCT mt.type_name ORDER BY mt.type_name) AS types
FROM tbimport i
LEFT JOIN tbimport_detail d ON d.im_id = i.im_id
LEFT JOIN tbmedicines m ON m.med_id = d.med_id
LEFT JOIN tbmedicinestype mt ON mt.medtype_id = m.medtype_id
GROUP BY i.im_id
ORDER BY i.im_id ASC

  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        error: "Get import failed", 
        details: err.message 
      });
    }
    res.status(200).json({ data: results });
  });
});

// เพิ่ม endpoint สำหรับดึงรหัสล่าสุดของบริการทั่วไป (NOT PACKAGE)
router.get("/next-import-id", (req, res) => {
    const query = `
        SELECT im_id FROM tbimport WHERE im_id LIKE 'IM%' ORDER BY im_id DESC LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດ ❌", details: err });
        }
        
        let nextId = "IM001"; // รหัสเริ่มต้น
        
        if (results.length > 0) {
            const lastId = results[0].im_id;
            const lastNumber = parseInt(lastId.substring(2));
            const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
            nextId = `IM${nextNumber}`;
        }
        
        res.status(200).json({ 
            message: "ດຶງລະຫັດຖັດໄປສຳເລັດ ✅", 
            nextId: nextId 
        });
    });
});

router.get("/import/:id", (req, res) => {
  const { id } = req.params;
  
  const query = "SELECT * FROM tbimport WHERE im_id = ?";
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        error: "Get import failed", 
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: "Import not found",
        message: "ไม่พบข้อมูล import ที่ระบุ"
      });
    }
    
    res.status(200).json({ data: results[0] });
  });
});

// ✅ PUT - อัพเดทข้อมูล import
router.put("/import/:id", upload.single('file'), (req, res) => {
  try {
    const { id } = req.params;
    const { im_date, preorder_id, emp_id_create, note= '' } = req.body;
    
    db.query("SELECT * FROM tbimport WHERE im_id = ?", [id], (err, results) => {
      if (err) {
        return res.status(500).json({ 
          error: "Database error", 
          details: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ 
          error: "Import not found",
          message: "ไม่พบข้อมูล import ที่ระบุ"
        });
      }
      
      const oldData = results[0];
      let fileName = oldData.file;
      
      if (req.file) {
        if (oldData.file) {
          const oldFilePath = path.join(uploadDir, oldData.file);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        fileName = req.file.filename;
      }
      
      const updateQuery = `
        UPDATE tbimport 
        SET im_date = ?, preorder_id = ?, file = ?, emp_id_create = ?, note = ?
        WHERE im_id = ?
      `;
      
      db.query(updateQuery, [im_date, preorder_id || null, fileName, emp_id_create, note, id], (err) => {
        if (err) {
          console.error("Update error:", err);
          return res.status(500).json({ 
            error: "Update import failed", 
            details: err.message 
          });
        }
        
        res.status(200).json({ 
          message: "Update import success ✅",
          data: {
            im_id: id,
            im_date,
            preorder_id: preorder_id || null,
            file: fileName,
            emp_id_create: emp_id_create,
            note: note
          }
        });
      });
    });
    
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      error: "Server error", 
      details: error.message 
    });
  }
});

router.delete("/import/:id", (req, res) => {
  const { id } = req.params;
  
  db.query("SELECT file, preorder_id FROM tbimport WHERE im_id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: "Database error", 
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: "Import not found",
        message: "ไม่พบข้อมูล import ที่ระบุ"
      });
    }
    
    const fileName = results[0].file;
    const preorder_id = results[0].preorder_id; // ✅ ดึง preorder_id จากผลลัพธ์

    // ✅ ลบข้อมูลจากฐานข้อมูล
    db.query("DELETE FROM tbimport WHERE im_id = ?", [id], (err) => {
      if (err) {
        return res.status(500).json({ 
          error: "Delete import failed", 
          details: err.message 
        });
      }

      // ✅ ลบไฟล์ถ้ามี
      if (fileName) {
        const filePath = path.join(uploadDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // ✅ ถ้ามี preorder_id ให้อัปเดตสถานะเป็น 'ລໍຖ້າຈັດສົ່ງ'
      if (preorder_id) {
        const updateStatusQuery = 'UPDATE tbpreorder SET status = ? WHERE preorder_id = ?';
        db.query(updateStatusQuery, ['ລໍຖ້າຈັດສົ່ງ', preorder_id], (err) => {
          if (err) {
            console.error("Failed to update preorder status:", err.message);
          }
          // ✅ ไม่ต้องรอการอัปเดต status ก็สามารถส่ง response ได้
        });
      }
      
      res.status(200).json({ 
        message: "Delete import success ✅" 
      });
    });
  });
});


// เพิ่ม route ใหม่สำหรับการดูไฟล์ (แทนที่จะดาวน์โหลด)
router.get("/view/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);
  
  // ✅ ตรวจสอบว่าไฟล์มีอยู่จริง
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: "File not found",
      message: "ไม่พบไฟล์ที่ระบุ"
    });
  }
  
  // ✅ กำหนด Content-Type ตามประเภทไฟล์
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  switch(ext) {
    case '.pdf':
      contentType = 'application/pdf';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.doc':
      contentType = 'application/msword';
      break;
    case '.docx':
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
    case '.xls':
      contentType = 'application/vnd.ms-excel';
      break;
    case '.xlsx':
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;
  }
  
  // ✅ ตั้งค่า header เพื่อให้เบราว์เซอร์เปิดไฟล์แทนที่จะดาวน์โหลด
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', 'inline'); // สำคัญ! ใช้ 'inline' แทน 'attachment'
  
  // ✅ ส่งไฟล์
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("View file error:", err);
      res.status(500).json({
        error: "View file failed",
        details: err.message
      });
    }
  });
});

// ✅ เก็บ route เดิมไว้สำหรับการดาวน์โหลด (ถ้าต้องการ)
router.get("/download/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: "File not found",
      message: "ไม่พบไฟล์ที่ระบุ"
    });
  }
  
  // ✅ ส่งไฟล์ให้ดาวน์โหลด
  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({
        error: "Download failed",
        details: err.message
      });
    }
  });
});
  
module.exports = router;

