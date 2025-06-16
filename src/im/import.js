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
router.post("/", upload.single('file'), (req, res) => {
  try {
    const { im_id, im_date, preorder_id, emp_id, note } = req.body;
    
    // ✅ เช็คว่ามีไฟล์หรือไม่
    let fileName = null;
    if (req.file) {
      fileName = req.file.filename;
    }

    // ✅ ตรวจสอบข้อมูลที่จำเป็น
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
      // ถ้ามี preorder_id ให้อัปเดตสถานะเป็น 'ສຳເລັດ'
      if (preorder_id) {
        const updateStatusQuery = 'UPDATE tbpreorder SET status = ? WHERE preorder_id = ?';
        db.query(updateStatusQuery, ['ສຳເລັດ', preorder_id]);
    }
      
      res.status(200).json({ 
        message: "Insert import success ✅",
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
router.get("/", (req, res) => {
  const query = `
    SELECT 
      im_id,
      im_date,
      preorder_id,
      file,
      emp_id_create,
      note
    FROM tbimport 
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

// ✅ GET - รับข้อมูล import ตาม ID
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
router.put("/:id", upload.single('file'), (req, res) => {
  try {
    const { id } = req.params;
    const { im_date, preorder_id, emp_id } = req.body;
    
    // ✅ ดึงข้อมูลเดิมก่อน
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
      let fileName = oldData.file; // ใช้ไฟล์เดิม
      
      // ✅ ถ้ามีไฟล์ใหม่ ให้ลบไฟล์เดิมและใช้ไฟล์ใหม่
      if (req.file) {
        // ลบไฟล์เดิม
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
      
      db.query(updateQuery, [im_date, preorder_id || null, fileName, emp_id, note, id], (err) => {
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
            emp_id_create: emp_id,
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

// ✅ DELETE - ลบข้อมูล import
router.delete("/import/:id", (req, res) => {
  const { id } = req.params;
  
  // ✅ ดึงข้อมูลก่อนลบเพื่อลบไฟล์ด้วย
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



// const express = require("express");
// const router = express.Router();
// const db = require("../../db");
// const multer = require("multer");
// const upload = multer();
// const path = require("path");
// const fs = require("fs");

// router.get("/import", (req, res) => {
//   db.query("SELECT * FROM tbimport", (err, results) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ error: "ດຶງຂໍ້ມູນ import ບໍ່ໄດ້ ❌", details: err });
//     }
//     res.status(200).json({ message: "ສຳເລັດ ✅", data: results });
//   });
// });

// router.get("/import/:id", (req, res) => {
//   const { id } = req.params;
//   db.query("SELECT * FROM tbimport WHERE im_id = ?", [id], (err, results) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ error: "ດຶງຂໍ້ມູນ import ບໍ່ໄດ້ ❌", details: err });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ message: "ບໍ່ພົບ import ນີ້" });
//     }
//     res.status(200).json({ message: "ສຳເລັດ ✅", data: results[0] });
//   });
// });


// router.post("/import", upload.single("document"), (req, res) => {
//   const {
//     im_id,
//     im_date,
//     qty,
//     expired,
//     lot,
//     sup_id,
//     med_id,
//     emp_id_create,
//     created_at,
//   } = req.body;

//   const fileBuffer = req.file?.buffer || null;

//   const query = `
//     INSERT INTO tbimport (
//       im_id, im_date, qty, expired, lot, file,
//       sup_id, med_id, emp_id_create, created_at
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(
//     query,
//     [
//       im_id,
//       im_date,
//       qty,
//       expired,
//       lot,
//       fileBuffer,  
//       sup_id,
//       med_id,
//       emp_id_create,
//       created_at,
//     ],
//     (err, result) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນຢາໄດ້ ❌", details: err });
//       }
//       res
//         .status(201)
//         .json({ message: "ເພີ່ມຂໍ້ມູນຢາສຳເລັດ ✅", med_id: result.insertId });
//     }
//   );
// });



// router.put("/import/:id", upload.single("document"), (req, res) => {
//   const { id } = req.params;
//   const {
//     im_date,
//     qty,
//     expired,
//     lot,
//     sup_id,
//     med_id,
//     emp_id_updated,
//     update_by,
//   } = req.body;

//   const fileBuffer = req.file?.buffer || null; // ถ้ามีไฟล์ใหม่ให้เก็บ ถ้าไม่มีให้เก็บเป็น null หรือเก็บไฟล์เดิม

//   let query;
//   let params;

//   if (fileBuffer) {
//     // อัปเดตพร้อมไฟล์ใหม่
//     query = `
//       UPDATE tbimport SET
//         im_date = ?, qty = ?, expired = ?, lot = ?, file = ?,
//         sup_id = ?, med_id = ?, emp_id_updated = ?, update_by = ?
//       WHERE im_id = ?
//     `;
//     params = [
//       im_date,
//       qty,
//       expired,
//       lot,
//       fileBuffer,
//       sup_id,
//       med_id,
//       emp_id_updated,
//       update_by,
//       id,
//     ];
//   } else {
//     // อัปเดตโดยไม่แก้ไขไฟล์
//     query = `
//       UPDATE tbimport SET
//         im_date = ?, qty = ?, expired = ?, lot = ?,
//         sup_id = ?, med_id = ?, emp_id_updated = ?, update_by = ?
//       WHERE im_id = ?
//     `;
//     params = [
//       im_date,
//       qty,
//       expired,
//       lot,
//       sup_id,
//       med_id,
//       emp_id_updated,
//       update_by,
//       id,
//     ];
//   }

//   db.query(query, params, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: "ແກ້ໄຂ import ບໍ່ໄດ້ ❌", details: err });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "ບໍ່ພົບ import ທີ່ຈະແກ້ໄຂ" });
//     }
//     res.status(200).json({ message: "ແກ້ໄຂ import ສຳເລັດ ✅" });
//   });
// });


// // 👉 DELETE: ลบข้อมูล
// router.delete("/import/:id", (req, res) => {
//   const { id } = req.params;
//   db.query("DELETE FROM tbimport WHERE im_id = ?", [id], (err, result) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ error: "ລຶບ import ບໍ່ໄດ້ ❌", details: err });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "ບໍ່ພົບ import ທີ່ຈະລຶບ" });
//     }
//     res.status(200).json({ message: "ລຶບ import ສຳເລັດ ✅" });
//   });
// });

// router.get("/download/:id", (req, res) => {
//   const id = req.params.id;

//   const query = "SELECT file FROM tbimport WHERE im_id = ?";

//   db.query(query, [id], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "ບໍ່ສາມາດເອົາໄຟລ໌ອອກໄດ້", details: err });
//     }
//     if (results.length === 0 || !results[0].file) {
//       return res.status(404).json({ message: "ບໍ່ພົບໄຟລ໌" });
//     }

//     const fileBuffer = results[0].file;

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="file_${id}.pdf"`,
//       "Content-Length": fileBuffer.length,
//     });

//     res.send(fileBuffer);
//   });
// });

// module.exports = router;
