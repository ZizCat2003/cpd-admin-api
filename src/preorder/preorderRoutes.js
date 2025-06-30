const express = require("express");
const router = express.Router();
const moment = require("moment");
const { queryAsync } = require("../../helper/queryfunction");

router.post("/", async (req, res) => {
  const { status, sup_id, details } = req.body;

  if (!Array.isArray(details) || details.length === 0) {
    return res.status(400).json({ message: "Details array is required." });
  }

  const preorder_date = moment().format("YYYY-MM-DD HH:mm:ss");

  const insertPreorder = `
    INSERT INTO dbcpsc_admin_cc.tbpreorder (preorder_date, status, sup_id)
    VALUES (?, ?, ?)
  `;

  const insertDetail = `
    INSERT INTO dbcpsc_admin_cc.tbpreorder_detail (preorder_id, med_id, qty)
    VALUES (?, ?, ?)
  `;

  const status_first = 'WAITING';

  try {
    // Insert into tbpreorder
    const result = await queryAsync(insertPreorder, [preorder_date, status_first, sup_id]);
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


router.get("/", async (req, res) => {
  try {
    // 1. Get all preorders with optional supplier (LEFT JOIN)
    const preorders = await queryAsync(`
      SELECT 
        p.preorder_id,
        p.preorder_date,
        p.status,
        p.sup_id,
        s.company_name
      FROM 
        dbcpsc_admin_cc.tbpreorder p
      LEFT JOIN 
        dbcpsc_admin_cc.tbsupplier s ON p.sup_id = s.sup_id
    `);

    // 2. Get all preorder_details joined with medicine
    const details = await queryAsync(`
      SELECT 
        d.detail_id,
        d.preorder_id,
        d.med_id,
        m.med_name,
        d.qty
      FROM 
        dbcpsc_admin_cc.tbpreorder_detail d
      JOIN 
        dbcpsc_admin_cc.tbmedicines m ON d.med_id = m.med_id
    `);

    // 3. Merge details into each preorder
    const result = preorders.map(preorder => {
      const detailItems = details
        .filter(d => d.preorder_id === preorder.preorder_id)
        .map(d => ({
          detail_id: d.detail_id,
          med_id: d.med_id,
          med_name: d.med_name,
          qty: d.qty
        }));

      return {
        preorder_id: preorder.preorder_id,
        preorder_date: moment(preorder.preorder_date).format("YYYY-MM-DD HH:mm"),
        status: preorder.status,
        sup_id: preorder.sup_id ?? null,
        company_name: preorder.company_name ?? null,
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
         FROM dbcpsc_admin_cc.tbpreorder
         WHERE preorder_id = ?`
      : `SELECT preorder_id, preorder_date, status, sup_id
         FROM dbcpsc_admin_cc.tbpreorder`;

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
        dbcpsc_admin_cc.tbpreorder_detail d
      JOIN 
        dbcpsc_admin_cc.tbmedicines m ON d.med_id = m.med_id
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
    UPDATE dbcpsc_admin_cc.tbpreorder
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

module.exports = router;




