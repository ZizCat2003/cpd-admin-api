const express = require("express");
const router = express.Router();
const db = require("../../db");
const multer = require("multer");
const upload = multer();
const path = require("path");
const fs = require("fs");

router.get("/import", (req, res) => {
  db.query("SELECT * FROM tbimport", (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "ດຶງຂໍ້ມູນ import ບໍ່ໄດ້ ❌", details: err });
    }
    res.status(200).json({ message: "ສຳເລັດ ✅", data: results });
  });
});

router.get("/import/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM tbimport WHERE im_id = ?", [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "ດຶງຂໍ້ມູນ import ບໍ່ໄດ້ ❌", details: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "ບໍ່ພົບ import ນີ້" });
    }
    res.status(200).json({ message: "ສຳເລັດ ✅", data: results[0] });
  });
});


router.post("/import", upload.single("document"), (req, res) => {
  const {
    im_id,
    im_date,
    qty,
    expired,
    lot,
    sup_id,
    med_id,
    emp_id_create,
    created_at,
  } = req.body;

  const fileBuffer = req.file?.buffer || null;

  const query = `
    INSERT INTO tbimport (
      im_id, im_date, qty, expired, lot, file,
      sup_id, med_id, emp_id_create, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      im_id,
      im_date,
      qty,
      expired,
      lot,
      fileBuffer,  
      sup_id,
      med_id,
      emp_id_create,
      created_at,
    ],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນຢາໄດ້ ❌", details: err });
      }
      res
        .status(201)
        .json({ message: "ເພີ່ມຂໍ້ມູນຢາສຳເລັດ ✅", med_id: result.insertId });
    }
  );
});



router.put("/import/:id", upload.single("document"), (req, res) => {
  const { id } = req.params;
  const {
    im_date,
    qty,
    expired,
    lot,
    sup_id,
    med_id,
    emp_id_updated,
    update_by,
  } = req.body;

  const fileBuffer = req.file?.buffer || null; // ถ้ามีไฟล์ใหม่ให้เก็บ ถ้าไม่มีให้เก็บเป็น null หรือเก็บไฟล์เดิม

  let query;
  let params;

  if (fileBuffer) {
    // อัปเดตพร้อมไฟล์ใหม่
    query = `
      UPDATE tbimport SET
        im_date = ?, qty = ?, expired = ?, lot = ?, file = ?,
        sup_id = ?, med_id = ?, emp_id_updated = ?, update_by = ?
      WHERE im_id = ?
    `;
    params = [
      im_date,
      qty,
      expired,
      lot,
      fileBuffer,
      sup_id,
      med_id,
      emp_id_updated,
      update_by,
      id,
    ];
  } else {
    // อัปเดตโดยไม่แก้ไขไฟล์
    query = `
      UPDATE tbimport SET
        im_date = ?, qty = ?, expired = ?, lot = ?,
        sup_id = ?, med_id = ?, emp_id_updated = ?, update_by = ?
      WHERE im_id = ?
    `;
    params = [
      im_date,
      qty,
      expired,
      lot,
      sup_id,
      med_id,
      emp_id_updated,
      update_by,
      id,
    ];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ແກ້ໄຂ import ບໍ່ໄດ້ ❌", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ບໍ່ພົບ import ທີ່ຈະແກ້ໄຂ" });
    }
    res.status(200).json({ message: "ແກ້ໄຂ import ສຳເລັດ ✅" });
  });
});


// 👉 DELETE: ลบข้อมูล
router.delete("/import/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM tbimport WHERE im_id = ?", [id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "ລຶບ import ບໍ່ໄດ້ ❌", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ບໍ່ພົບ import ທີ່ຈະລຶບ" });
    }
    res.status(200).json({ message: "ລຶບ import ສຳເລັດ ✅" });
  });
});

router.get("/download/:id", (req, res) => {
  const id = req.params.id;

  const query = "SELECT file FROM tbimport WHERE im_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "ບໍ່ສາມາດເອົາໄຟລ໌ອອກໄດ້", details: err });
    }
    if (results.length === 0 || !results[0].file) {
      return res.status(404).json({ message: "ບໍ່ພົບໄຟລ໌" });
    }

    const fileBuffer = results[0].file;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="file_${id}.pdf"`,
      "Content-Length": fileBuffer.length,
    });

    res.send(fileBuffer);
  });
});

module.exports = router;
