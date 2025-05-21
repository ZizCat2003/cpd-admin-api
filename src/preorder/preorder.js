const express = require("express");
const router = express.Router();
const db = require("../../db");


router.get("/", (req, res) => {
  db.query("SELECT * FROM tbpreorder", (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນ preorder ❌", details: err });
    }
    res.status(200).json({ message: "ສຳເລັດ ✅", data: results });
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM tbpreorder WHERE preorder_id = ?",
    [id],
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "ດຶງຂໍ້ມູນ preorder ບໍ່ໄດ້ ❌", details: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "ບໍ່ພົບ preorder ນີ້" });
      }
      res.status(200).json({ message: "ສຳເລັດ ✅", data: results[0] });
    }
  );
});
router.post("/", (req, res) => {
  const {
    preorder_id,
    preorder_date,
    qty,
    status,
    lot,
    sup_id,
    med_id,
    emp_id_create,
    created_at,
  } = req.body;

  let fixedPreorderDate = new Date(preorder_date);
  fixedPreorderDate.setHours(12, 0, 0, 0);

  const query = `
    INSERT INTO tbpreorder (
      preorder_id,
      preorder_date,
      qty,
      status,
      lot,
      sup_id,
      med_id,
      emp_id_create,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      preorder_id,
      fixedPreorderDate,
      qty,
      status,
      lot,
      sup_id,
      med_id,
      emp_id_create,
      created_at,
    ],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "ບັນທຶກ preorder ບໍ່ສຳເລັດ ❌", details: err });
      }
      res.status(201).json({
        message: "ບັນທຶກ preorder ສຳເລັດ ✅",
        preorder_id: preorder_id,
      });
    }
  );
});



router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    preorder_date,
    qty,
    status,
    lot,
    sup_id,
    med_id,
    emp_id_updated,
    update_by,
  } = req.body;

  const query = `
    UPDATE tbpreorder
    SET
      preorder_date = ?,
      qty = ?,
      status = ?,
      lot = ?,
      sup_id = ?,
      med_id = ?,
      emp_id_updated = ?,
      update_by = ?
    WHERE preorder_id = ?
  `;

  db.query(
    query,
    [
      preorder_date,
      qty,
      status,
      lot,
      sup_id,
      med_id,
      emp_id_updated,
      update_by,
      id,
    ],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "ແກ້ໄຂ preorder ບໍ່ໄດ້ ❌", details: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ບໍ່ພົບ preorder ທີ່ຈະແກ້ໄຂ" });
      }
      res.status(200).json({ message: "ແກ້ໄຂ preorder ສຳເລັດ ✅" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM tbpreorder WHERE preorder_id = ?",
    [id],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "ລຶບ preorder ບໍ່ໄດ້ ❌", details: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ບໍ່ພົບ preorder ທີ່ຈະລຶບ" });
      }
      res.status(200).json({ message: "ລຶບ preorder ສຳເລັດ ✅" });
    }
  );
});

module.exports = router;
