const express = require("express");
const router = express.Router();
const db = require("../../db");
const multer = require('multer');
const upload = multer();

router.post("/import", upload.single('file'), (req, res) => {
  const {
    im_id,
    im_date,
    qty,
    expired,
    lot,
    sup_id,
    med_id,
    emp_id_create,
    emp_id_updated,
    created_at,
    update_by,
  } = req.body;

  const fileBuffer = req.file?.buffer;

  const query = `
    INSERT INTO tbimport (
      im_id, im_date, qty, expired, lot, file,
      sup_id, med_id, emp_id_create, emp_id_updated,
      created_at, update_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      im_id, im_date, qty, expired, lot, fileBuffer,
      sup_id, med_id, emp_id_create, emp_id_updated,
      created_at, update_by,
    ],
    (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມ import ❌", details: err });
      }
      res.status(200).json({ message: "ເພີ່ມ import ສຳເລັດ ✅" });
    }
  );
});


// 👉 GET: ดึงข้อมูลทั้งหมด
router.get("/import", (req, res) => {
  db.query("SELECT * FROM tbimport", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "ດຶງຂໍ້ມູນ import ບໍ່ໄດ້ ❌", details: err });
    }
    res.status(200).json({ message: "ສຳເລັດ ✅", data: results });
  });
});

// 👉 GET: ดึงข้อมูลตาม ID
router.get("/import/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM tbimport WHERE im_id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "ດຶງຂໍ້ມູນ import ບໍ່ໄດ້ ❌", details: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "ບໍ່ພົບ import ນີ້" });
    }
    res.status(200).json({ message: "ສຳເລັດ ✅", data: results[0] });
  });
});

// 👉 PUT: แก้ไขข้อมูล
router.put("/import/:id", (req, res) => {
  const { id } = req.params;
  const {
    im_date, qty, expired, lot, file,
    sup_id, med_id, emp_id_create, emp_id_updated,
    created_at, update_by
  } = req.body;

  const query = `
    UPDATE tbimport SET
      im_date = ?, qty = ?, expired = ?, lot = ?, file = ?,
      sup_id = ?, med_id = ?, emp_id_create = ?, emp_id_updated = ?,
      created_at = ?, update_by = ?
    WHERE im_id = ?
  `;

  db.query(
    query,
    [
      im_date, qty, expired, lot, file,
      sup_id, med_id, emp_id_create, emp_id_updated,
      created_at, update_by, id,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "ແກ້ໄຂ import ບໍ່ໄດ້ ❌", details: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ບໍ່ພົບ import ທີ່ຈະແກ້ໄຂ" });
      }
      res.status(200).json({ message: "ແກ້ໄຂ import ສຳເລັດ ✅" });
    }
  );
});

// 👉 DELETE: ลบข้อมูล
router.delete("/import/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM tbimport WHERE im_id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ລຶບ import ບໍ່ໄດ້ ❌", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ບໍ່ພົບ import ທີ່ຈະລຶບ" });
    }
    res.status(200).json({ message: "ລຶບ import ສຳເລັດ ✅" });
  });
});

module.exports = router;
