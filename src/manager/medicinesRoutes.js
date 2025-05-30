// medicinesRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/medicines", (req, res) => {
  const query = "SELECT * FROM tbmedicines";
  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນຢາ ❌", details: err });
    }
    res.status(200).json({ message: "ສະແດງຂໍ້ມູນຢາສຳເລັດ ✅", data: results });
  });
});

// router.get("/medicines/:id", (req, res) => {
//     const { id } = req.params;

//     const query = "SELECT * FROM tbmedicines WHERE med_id = ?";
//     db.query(query, [id], (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນຢາ ❌", details: err });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
//         }
//         res.status(200).json({ message: "ສະແດງຂໍ້ມູນຢາສຳເລັດ ✅", data: results[0] });
//     });
// });

router.get("/medicines/:id", (req, res) => {
  const { id } = req.params;
  //   console.log(id);

  try {
    const cate_type = id.toString().toUpperCase();
    let query = `SELECT * FROM tbmedicines`;

    if (id && id !== "") {
      query += ` WHERE medtype_id = ?`;
    }

    query += ` ORDER BY med_id ASC`;

    db.query(query, [cate_type], (err, results) => {
      // console.log(query);
      if (err) {
        return res.status(500).json({ error: "Data not found", details: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "id not found" });
      }
      res
        .status(200)
        .json({ resultCode: "200", message: "Query Success", data: results });
    });
  } catch (error) {
    res.status(299).json({
      message: "API Error",
      error: error.message,
    });
  }
});
router.post("/medicines", (req, res) => {
  const {
    med_id,
    med_name,
    qty,
    status,
    unit,
    price,
    expired,
    medtype_id,
    emp_id_create,
    created_at,
  } = req.body;

  // เพิ่ม created_at ใน SQL query
  const query = `
        INSERT INTO tbmedicines (
            med_id, med_name, qty, status, unit, price, expired,
            medtype_id, emp_id_create, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  console.log('Request body:', req.body);
  console.log('Values to insert:', [
    med_id,
    med_name,
    qty,
    status,
    unit,
    price,
    expired,
    medtype_id,
    emp_id_create,
    created_at,
  ]);

  db.query(
    query,
    [
      med_id,
      med_name,
      qty,
      status,
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
          data: result
        });
    }
  );
});
router.put("/medicines/:id", (req, res) => {
  const { id } = req.params;
  const {
    med_name,
    qty,
    status,
    unit,
    price,
    expired,
    medtype_id,
    emp_id_updated,
    update_by,
  } = req.body;

  const query = `
        UPDATE tbmedicines
        SET med_name = ?, qty = ?, status = ?, unit = ?, price = ?, expired = ?,
            medtype_id = ?, emp_id_updated = ?, update_by = ?
        WHERE med_id = ?
    `;

  db.query(
    query,
    [
      med_name,
      qty,
      status,
      price,
      expired,
      medtype_id,
      emp_id_updated,
      update_by,
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
      res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນຢາສຳເລັດ ✅" });
    }
  );
});

router.delete("/medicines/:id", (req, res) => {
  const { id } = req.params;

  const deleteFromImport = "DELETE FROM tbimport WHERE med_id = ?";
  const deleteFromPreorder = "DELETE FROM tbpreorder WHERE med_id = ?";
  const deleteFromMedicines = "DELETE FROM tbmedicines WHERE med_id = ?";

  db.query(deleteFromImport, [id], (err) => {
    if (err)
      return res
        .status(500)
        .json({ error: "ລົບຂໍ້ມູນ import ບໍ່ສຳເລັດ", details: err });

    db.query(deleteFromPreorder, [id], (err) => {
      if (err)
        return res
          .status(500)
          .json({ error: "ລົບຂໍ້ມູນ preorder ບໍ່ສຳເລັດ", details: err });

      db.query(deleteFromMedicines, [id], (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ error: "ບໍ່ສາມາດລົບຂໍ້ມູນຢາ ❌", details: err });

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນຢານີ້" });
        }

        res.status(200).json({ message: "ລົບຂໍ້ມູນຢາສຳເລັດ ✅" });
      });
    });
  });
});

module.exports = router;
