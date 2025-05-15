const express = require("express");
const router = express.Router();
const db = require("../../db");

// 👉 POST: เพิ่มข้อมูล preorder
router.post("/preorder", (req, res) => {
  const { preorder_id, preorder_date, qty, status, lot, sup_id, med_id } = req.body;

  const query = `
    INSERT INTO tbpreorder (preorder_id, preorder_date, qty, status, lot, sup_id, med_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [preorder_id, preorder_date, qty, status, lot, sup_id, med_id], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມ preorder ❌", details: err });
    }
    res.status(200).json({ message: "ເພີ່ມ preorder ສຳເລັດ ✅" });
  });
});

// 👉 GET: แสดงข้อมูลทั้งหมด
router.get("/preorder", (req, res) => {
  db.query("SELECT * FROM tbpreorder", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນ preorder ❌", details: err });
    }
    res.status(200).json({ message: "ສຳເລັດ ✅", data: results });
  });
});

// 👉 GET: แสดงข้อมูลตาม id
router.get("/preorder/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM tbpreorder WHERE preorder_id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "ດຶງຂໍ້ມູນ preorder ບໍ່ໄດ້ ❌", details: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "ບໍ່ພົບ preorder ນີ້" });
    }
    res.status(200).json({ message: "ສຳເລັດ ✅", data: results[0] });
  });
});

// 👉 PUT: แก้ไขข้อมูล preorder
router.put("/preorder/:id", (req, res) => {
  const { id } = req.params;
  const { preorder_date, qty, status, lot, sup_id, med_id } = req.body;

  const query = `
    UPDATE tbpreorder
    SET preorder_date = ?, qty = ?, status = ?, lot = ?, sup_id = ?, med_id = ?
    WHERE preorder_id = ?
  `;

  db.query(query, [preorder_date, qty, status, lot, sup_id, med_id, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ແກ້ໄຂ preorder ບໍ່ໄດ້ ❌", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ບໍ່ພົບ preorder ທີ່ຈະແກ້ໄຂ" });
    }
    res.status(200).json({ message: "ແກ້ໄຂ preorder ສຳເລັດ ✅" });
  });
});

// 👉 DELETE: ลบข้อมูล preorder
router.delete("/preorder/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM tbpreorder WHERE preorder_id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ລຶບ preorder ບໍ່ໄດ້ ❌", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ບໍ່ພົບ preorder ທີ່ຈະລຶບ" });
    }
    res.status(200).json({ message: "ລຶບ preorder ສຳເລັດ ✅" });
  });
});

module.exports = router;
