
const express = require("express");
const router = express.Router();
const db = require("../../db");

/// POST
router.post("/", (req, res) => {
  const { preorder_id, preorder_date, status, sup_id, emp_id_create } = req.body;

  const query = `
    INSERT INTO tbpreorder (preorder_id, preorder_date, status, sup_id, emp_id_create)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [preorder_id, preorder_date, status, sup_id, emp_id_create], (err) => {
    if (err) return res.status(500).json({ error: "Insert preorder failed", details: err });
    res.status(200).json({ message: "Insert preorder success ✅" });
  });
});

// GET: ทั้งหมด
router.get("/", (req, res) => {
  db.query("SELECT * FROM tbpreorder", (err, results) => {
    if (err) return res.status(500).json({ error: "Get preorder failed", details: err });
    res.status(200).json({ data: results });
  });
});

// GET: รายการเดียว
router.get("/:id", (req, res) => {
  db.query("SELECT * FROM tbpreorder WHERE preorder_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Get single preorder failed", details: err });
    if (results.length === 0) return res.status(404).json({ message: "Preorder not found" });
    res.status(200).json({ data: results[0] });
  });
});


// แก้ไขข้อมูลสั่งซื้อ
router.put("/:id", (req, res) => {
  const { id } = req.params; // ดึง id จาก URL
  const { preorder_date, sup_id, emp_id_create } = req.body; // ดึงข้อมูลจาก body

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!preorder_date || !sup_id || !emp_id_create) {
    return res.status(400).json({
      error: "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ",
      required: ["preorder_date", "sup_id", "emp_id_create"]
    });
  }

  const query = `
        UPDATE tbpreorder 
        SET preorder_date = ?, sup_id = ?, emp_id_create = ? 
        WHERE preorder_id = ?;
    `;

  db.query(query, [preorder_date, sup_id, emp_id_create, id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນສັ່ງຊື້ ❌",
        details: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນສັ່ງຊື້ຢານີ້"
      });
    }

    res.status(200).json({
      message: "ແກ້ໄຂຂໍ້ມູນສັ່ງຊື້ສຳເລັດ ✅",
      affectedRows: result.affectedRows
    });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM tbpreorder WHERE preorder_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete preorder failed", details: err });
    res.status(200).json({ message: "Delete preorder success ✅" });
  });
});

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const db = require("../../db");


// router.get("/", (req, res) => {
//   db.query("SELECT * FROM tbpreorder", (err, results) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນ preorder ❌", details: err });
//     }
//     res.status(200).json({ message: "ສຳເລັດ ✅", data: results });
//   });
// });

// router.get("/:id", (req, res) => {
//   const { id } = req.params;

//   db.query(
//     "SELECT * FROM tbpreorder WHERE preorder_id = ?",
//     [id],
//     (err, results) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ error: "ດຶງຂໍ້ມູນ preorder ບໍ່ໄດ້ ❌", details: err });
//       }
//       if (results.length === 0) {
//         return res.status(404).json({ message: "ບໍ່ພົບ preorder ນີ້" });
//       }
//       res.status(200).json({ message: "ສຳເລັດ ✅", data: results[0] });
//     }
//   );
// });
// router.post("/", (req, res) => {
//   const {
//     preorder_id,
//     preorder_date,
//     qty,
//     status,
//     lot,
//     sup_id,
//     med_id,
//     emp_id_create,
//     created_at,
//   } = req.body;

//   let fixedPreorderDate = new Date(preorder_date);
//   fixedPreorderDate.setHours(12, 0, 0, 0);

//   const query = `
//     INSERT INTO tbpreorder (
//       preorder_id,
//       preorder_date,
//       qty,
//       status,
//       lot,
//       sup_id,
//       med_id,
//       emp_id_create,
//       created_at
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(
//     query,
//     [
//       preorder_id,
//       fixedPreorderDate,
//       qty,
//       status,
//       lot,
//       sup_id,
//       med_id,
//       emp_id_create,
//       created_at,
//     ],
//     (err, result) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ error: "ບັນທຶກ preorder ບໍ່ສຳເລັດ ❌", details: err });
//       }
//       res.status(201).json({
//         message: "ບັນທຶກ preorder ສຳເລັດ ✅",
//         preorder_id: preorder_id,
//       });
//     }
//   );
// });



// router.put("/:id", (req, res) => {
//   const { id } = req.params;
//   const {
//     preorder_date,
//     qty,
//     status,
//     lot,
//     sup_id,
//     med_id,
//     emp_id_updated,
//     update_by,
//   } = req.body;

//   const query = `
//     UPDATE tbpreorder
//     SET
//       preorder_date = ?,
//       qty = ?,
//       status = ?,
//       lot = ?,
//       sup_id = ?,
//       med_id = ?,
//       emp_id_updated = ?,
//       update_by = ?
//     WHERE preorder_id = ?
//   `;

//   db.query(
//     query,
//     [
//       preorder_date,
//       qty,
//       status,
//       lot,
//       sup_id,
//       med_id,
//       emp_id_updated,
//       update_by,
//       id,
//     ],
//     (err, result) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ error: "ແກ້ໄຂ preorder ບໍ່ໄດ້ ❌", details: err });
//       }
//       if (result.affectedRows === 0) {
//         return res.status(404).json({ message: "ບໍ່ພົບ preorder ທີ່ຈະແກ້ໄຂ" });
//       }
//       res.status(200).json({ message: "ແກ້ໄຂ preorder ສຳເລັດ ✅" });
//     }
//   );
// });

// router.delete("/:id", (req, res) => {
//   const { id } = req.params;

//   db.query(
//     "DELETE FROM tbpreorder WHERE preorder_id = ?",
//     [id],
//     (err, result) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ error: "ລຶບ preorder ບໍ່ໄດ້ ❌", details: err });
//       }
//       if (result.affectedRows === 0) {
//         return res.status(404).json({ message: "ບໍ່ພົບ preorder ທີ່ຈະລຶບ" });
//       }
//       res.status(200).json({ message: "ລຶບ preorder ສຳເລັດ ✅" });
//     }
//   );
// });

// module.exports = router;
