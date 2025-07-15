const express = require("express");
const router = express.Router();
const moment = require("moment");
const { queryAsync } = require("../../helper/queryfunction");

// router.post("/", async (req, res) => {
//   const { status, sup_id, details } = req.body;

//   if (!Array.isArray(details) || details.length === 0) {
//     return res.status(400).json({ message: "Details array is required." });
//   }

//   const preorder_date = moment().format("YYYY-MM-DD HH:mm:ss");

//   const insertPreorder = `
//     INSERT INTO tbpreorder (preorder_date, status, sup_id)
//     VALUES (?, ?, ?)
//   `;

//   const insertDetail = `
//     INSERT INTO tbpreorder_detail (preorder_id, med_id, qty)
//     VALUES (?, ?, ?)
//   `;

//   const status_first = 'WAITING';

//   try {
//     // Insert into tbpreorder
//     const result = await queryAsync(insertPreorder, [preorder_date, status_first, sup_id]);
//     const preorder_id = result.insertId;

//     let successCount = 0;
//     let failed = [];

//     // Insert each detail in order using for...of
//     for (const item of details) {
//       try {
//         await queryAsync(insertDetail, [preorder_id, item.med_id, item.qty]);
//         successCount++;
//       } catch (error) {
//         failed.push({ med_id: item.med_id, error: error.message });
//       }
//     }

//     return res.status(200).json({
//       message: "Preorder created successfully",
//       preorder_id,
//       // inserted: successCount,
//       // failed: failed.length > 0 ? failed : null,
//     });

//   } catch (err) {
//     return res.status(500).json({
//       message: "Failed to create preorder",
//       error: err.message,
//     });
//   }
// });


// router.get("/", async (req, res) => {
//   try {
//     // 1. Get all preorders with optional supplier (LEFT JOIN)
//     const preorders = await queryAsync(`
//       SELECT 
//         p.preorder_id,
//         p.preorder_date,
//         p.status,
//         p.sup_id,
//         s.company_name
//       FROM 
//         tbpreorder p
//       LEFT JOIN 
//         tbsupplier s ON p.sup_id = s.sup_id
//     `);

//     // 2. Get all preorder_details joined with medicine
//     const details = await queryAsync(`
//       SELECT 
//         d.detail_id,
//         d.preorder_id,
//         d.med_id,
//         m.med_name,
//         d.qty
//       FROM 
//         tbpreorder_detail d
//       JOIN 
//         tbmedicines m ON d.med_id = m.med_id
//     `);

//     // 3. Merge details into each preorder
//     const result = preorders.map(preorder => {
//       const detailItems = details
//         .filter(d => d.preorder_id === preorder.preorder_id)
//         .map(d => ({
//           detail_id: d.detail_id,
//           med_id: d.med_id,
//           med_name: d.med_name,
//           qty: d.qty
//         }));

//       return {
//         preorder_id: preorder.preorder_id,
//         preorder_date: moment(preorder.preorder_date).format("YYYY-MM-DD HH:mm"),
//         status: preorder.status,
//         sup_id: preorder.sup_id ?? null,
//         company_name: preorder.company_name ?? null,
//         details: detailItems
//       };
//     });

//     res.status(200).json({
//       message: "Fetched preorder(s) with details and supplier",
//       data: result
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching preorder data",
//       error: error.message
//     });
//   }
// });

// router.get("/:id", async (req, res) => {
//   const { preorder_id } = req.query;

//   try {
//     // Get preorder(s)
//     const preorderSql = preorder_id
//       ? `SELECT preorder_id, preorder_date, status, sup_id
//          FROM tbpreorder
//          WHERE preorder_id = ?`
//       : `SELECT preorder_id, preorder_date, status, sup_id
//          FROM tbpreorder`;

//     const preorderParams = preorder_id ? [preorder_id] : [];

//     const preorders = await queryAsync(preorderSql, preorderParams);

//     if (preorders.length === 0) {
//       return res.status(404).json({ message: "No preorder(s) found." });
//     }

//     // Get details with med_name and detail_id
//     const detailSql = `
//       SELECT 
//         d.detail_id,
//         d.preorder_id,
//         d.med_id,
//         m.med_name,
//         d.qty
//       FROM 
//         tbpreorder_detail d
//       JOIN 
//         tbmedicines m ON d.med_id = m.med_id
//       ${preorder_id ? "WHERE d.preorder_id = ?" : ""}
//     `;

//     const detailParams = preorder_id ? [preorder_id] : [];

//     const details = await queryAsync(detailSql, detailParams);

//     // Merge nested
//     const result = preorders.map(preorder => ({
//       preorder_id: preorder.preorder_id,
//       preorder_date: moment(preorder.preorder_date).format("YYYY-MM-DD HH:mm"),
//       status: preorder.status,
//       sup_id: preorder.sup_id,
//       details: details
//         .filter(d => d.preorder_id === preorder.preorder_id)
//         .map(d => ({
//           detail_id: d.detail_id,
//           med_id: d.med_id,
//           med_name: d.med_name,
//           qty: d.qty
//         }))
//     }));

//     res.status(200).json({
//       message: "Fetched preorder(s) with details",
//       data: result
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching preorder data",
//       error: error.message
//     });
//   }
// });

// router.put("/cancel/:id", async (req, res) => {
//   const preorderId = req.params.id;

//   const updateStatusSQL = `
//     UPDATE tbpreorder
//     SET status = 'CANCEL'
//     WHERE preorder_id = ?
//   `;

//   try {
//     const result = await queryAsync(updateStatusSQL, [preorderId]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Preorder not found" });
//     }

//     res.status(200).json({
//       message: "Preorder status updated to CANCEL",
//       preorder_id: preorderId
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error updating preorder status",
//       error: error.message
//     });
//   }
// });

// module.exports = router;




router.get("/", async (req, res) => {
  try {
    // 1. Get all preorders with optional supplier
    const preorders = await queryAsync(`
      SELECT 
        p.preorder_id,
        p.preorder_date,
        p.status,
        p.sup_id,
        p.emp_id_create,
        s.company_name,
        e.emp_name,
        e.emp_surname
      FROM 
        tbpreorder p
      LEFT JOIN 
        tbsupplier s ON p.sup_id = s.sup_id
      LEFT JOIN
        tbemployee e ON p.emp_id_create = e.emp_id
        GROUP BY p.preorder_id
        ORDER BY p.preorder_id ASC
    `);

    // 2. Get all preorder_details joined with medicine and medicine type
    const details = await queryAsync(`
      SELECT 
        d.detail_id,
        d.preorder_id,
        d.med_id,
        m.med_name,
        d.qty,
        mt.type_name,
        m.unit
      FROM 
        tbpreorder_detail d
      JOIN 
        tbmedicines m ON d.med_id = m.med_id
      LEFT JOIN 
        tbmedicinestype mt ON mt.medtype_id = m.medtype_id
    `);

    // 3. Merge details into each preorder
    const result = preorders.map(preorder => {
      const detailItems = details
        .filter(d => d.preorder_id === preorder.preorder_id)
        .map(d => ({
          detail_id: d.detail_id,
          med_id: d.med_id,
          med_name: d.med_name,
          qty: d.qty,
          type_name: d.type_name || 'ຢາທົ່ວໄປ', // default if null
          unit: d.unit || '-' // default unit fallback
        }));

      return {
        preorder_id: preorder.preorder_id,
        preorder_date: moment(preorder.preorder_date).format("YYYY-MM-DD HH:mm"),
        status: preorder.status,
        sup_id: preorder.sup_id ?? null,
        emp_id_create: preorder.emp_id_create ?? null,
        company_name: preorder.company_name ?? null,
        emp_name: preorder.emp_name ?? null,
        emp_surname: preorder.emp_surname ?? null,
        details: detailItems
      };
    });

    res.status(200).json({
      message: "Fetched preorder(s) with details and supplier",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching preorder data",
      error: error.message
    });
  }
});


router.get("/:id", async (req, res) => {
  const { preorder_id } = req.query;

  try {
    // Get preorder(s)
    const preorderSql = preorder_id
      ? `SELECT preorder_id, preorder_date, status, sup_id
         FROM tbpreorder
         WHERE preorder_id = ?`
      : `SELECT preorder_id, preorder_date, status, sup_id
         FROM tbpreorder`;

    const preorderParams = preorder_id ? [preorder_id] : [];

    const preorders = await queryAsync(preorderSql, preorderParams);

    if (preorders.length === 0) {
      return res.status(404).json({ message: "No preorder(s) found." });
    }

    // Get details with med_name and detail_id
    const detailSql = `
      SELECT 
        d.detail_id,
        d.preorder_id,
        d.med_id,
        m.med_name,
        d.qty
      FROM 
        tbpreorder_detail d
      JOIN 
        tbmedicines m ON d.med_id = m.med_id
      ${preorder_id ? "WHERE d.preorder_id = ?" : ""}
    `;

    const detailParams = preorder_id ? [preorder_id] : [];

    const details = await queryAsync(detailSql, detailParams);

    // Merge nested
    const result = preorders.map(preorder => ({
      preorder_id: preorder.preorder_id,
      preorder_date: moment(preorder.preorder_date).format("YYYY-MM-DD HH:mm"),
      status: preorder.status,
      sup_id: preorder.sup_id,
      details: details
        .filter(d => d.preorder_id === preorder.preorder_id)
        .map(d => ({
          detail_id: d.detail_id,
          med_id: d.med_id,
          med_name: d.med_name,
          qty: d.qty
        }))
    }));

    res.status(200).json({
      message: "Fetched preorder(s) with details",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching preorder data",
      error: error.message
    });
  }
});

router.put("/cancel/:id", async (req, res) => {
  const preorderId = req.params.id;

  const updateStatusSQL = `
    UPDATE tbpreorder
    SET status = 'CANCEL'
    WHERE preorder_id = ?
  `;

  try {
    const result = await queryAsync(updateStatusSQL, [preorderId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Preorder not found" });
    }

    res.status(200).json({
      message: "Preorder status updated to CANCEL",
      preorder_id: preorderId
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating preorder status",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  const { status, sup_id, emp_id_create, details } = req.body;

  if (!Array.isArray(details) || details.length === 0) {
    return res.status(400).json({ message: "Details array is required." });
  }

  // ตรวจสอบว่ามีการส่ง emp_id_create มาหรือไม่
  if (!emp_id_create) {
    return res.status(400).json({ message: "Employee ID is required." });
  }

  if (!sup_id) {
    return res.status(400).json({ message: "Supplier ID is required." });
  }

  const preorder_date = moment().format("YYYY-MM-DD HH:mm:ss");

  // อัปเดต SQL query ให้รวม emp_id_create
  const insertPreorder = `
    INSERT INTO tbpreorder (preorder_date, status, sup_id, emp_id_create)
    VALUES (?, ?, ?, ?)
  `;

  const insertDetail = `
    INSERT INTO tbpreorder_detail (preorder_id, med_id, qty)
    VALUES (?, ?, ?)
  `;

  const status_first = 'WAITING';

  try {
    // Insert into tbpreorder พร้อมกับ emp_id_create
    const result = await queryAsync(insertPreorder, [preorder_date, status_first, sup_id, emp_id_create]);
    const preorder_id = result.insertId;

    let successCount = 0;
    let failed = [];

    // Insert each detail in order using for...of
    for (const item of details) {
      try {
        await queryAsync(insertDetail, [preorder_id, item.med_id, item.qty]);
        successCount++;
      } catch (error) {
        failed.push({ med_id: item.med_id, error: error.message });
      }
    }

    return res.status(200).json({
      message: "Preorder created successfully",
      preorder_id,
      emp_id_create, // ส่งกลับเพื่อยืนยันว่าบันทึกแล้ว
      // inserted: successCount,
      // failed: failed.length > 0 ? failed : null,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to create preorder",
      error: err.message,
    });
  }
});
// GET: รายการเดียว
router.get("/preorder/:id", (req, res) => {
  db.query("SELECT * FROM tbpreorder WHERE preorder_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Get single preorder failed", details: err });
    if (results.length === 0) return res.status(404).json({ message: "Preorder not found" });
    res.status(200).json({ data: results[0] });
  });
});


// แก้ไขข้อมูลสั่งซื้อ
router.put("/preorder/:id", (req, res) => {
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
router.delete("/preorder/:id", (req, res) => {
  db.query("DELETE FROM tbpreorder WHERE preorder_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete preorder failed", details: err });
    res.status(200).json({ message: "Delete preorder success ✅" });
  });
});


module.exports = router;



