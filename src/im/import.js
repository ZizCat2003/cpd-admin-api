const express = require("express");
const router = express.Router();
const db = require("../../db");
const moment = require("moment");

router.post("/", async (req, res) => {
  const { preorder_id, file, note, details } = req.body;

  if (!details || !Array.isArray(details) || details.length === 0) {
    return res.status(400).json({ message: "Details are required" });
  }

  const insertImport = `
    INSERT INTO dbcpsc_admin_cc.tbimport (im_date, file,  preorder_id, note)
    VALUES (?, ?, ?, ?)
  `;

  const insertDetail = `
    INSERT INTO dbcpsc_admin_cc.tbimport_detail (im_id, med_id, expired_date, qty)
    VALUES (?, ?, ?, ?)
  `;

  const updateStock = `
    UPDATE dbcpsc_admin_cc.tbmedicines
    SET qty = qty + ?
    WHERE med_id = ?
  `;

  try {

    const im_date = moment().format("YYYY-MM-DD HH:mm:ss.SSS");

    db.query(
      insertImport,
      [im_date, file, preorder_id, note],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Insert import failed", error: err.message });

        const im_id = result.insertId;

        let successCount = 0;
        let failedItems = [];

        if (details.length > 0) {
          for (let i = 0; i < details.length; i++) {
            const item = details[i];
            db.query(insertDetail, [im_id, item.med_id, item.expired_date, item.qty], (err) => {
              if (err) {
                failedItems.push(item.med_id);
              } else {
                // Update stock in tbmedicines
                db.query(updateStock, [item.qty, item.med_id], (err) => {
                  if (err) failedItems.push(item.med_id);
                  else successCount++;
                });
              }
            });
          }
        }
        return res.status(200).json({
          message: "Import completed",
          importId: im_id,
        });
      }
    );

  } catch (error) {
    // console.error("Server error:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

router.get("/", (req, res) => {
  const query = `
    SELECT tbim.detail_id, tbim.im_id, tbim.med_id, tmed.med_name, tbim.expired_date, tbim.qty
    FROM dbcpsc_admin_cc.tbimport_detail tbim
    JOIN dbcpsc_admin_cc.tbmedicines tmed on tmed.med_id = tbim.med_id 
  `;

  db.query(query, (err, results) => {
    if (err) {
      // console.error("Database error:", err);
      return res.status(500).json({
        error: "Get import failed",
        details: err.message
      });
    }
    res.status(200).json({ data: results });
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Import ID is required" });
  }

  const selectImport = `
    SELECT im_id, im_date, file, preorder_id, note
    FROM dbcpsc_admin_cc.tbimport
    WHERE im_id = ?
  `;

  const selectDetails = `
    SELECT detail_id, im_id, med_id, expired_date, qty
    FROM dbcpsc_admin_cc.tbimport_detail
    WHERE im_id = ?
  `;

  db.query(selectImport, [id], (err, importResult) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });
    if (importResult.length === 0) return res.status(404).json({ message: "Import not found" });

    const importData = importResult[0];

    db.query(selectDetails, [id], (err, detailResult) => {
      if (err) return res.status(500).json({ message: "Failed to fetch import details", error: err.message });

      importData.details = detailResult;

      res.status(200).json({
        resultCode: 200,
        message: "Query successfully",
        data: importData
      });
    });
  });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { preorder_id, file, note, details } = req.body;

  if (!details || !Array.isArray(details) || details.length === 0) {
    return res.status(400).json({ message: "Details are required" });
  }

  const selectOldDetails = `
    SELECT med_id, qty FROM dbcpsc_admin_cc.tbimport_detail WHERE im_id = ?
  `;
  const deleteOldDetails = `
    DELETE FROM dbcpsc_admin_cc.tbimport_detail WHERE im_id = ?
  `;
  const updateStock = `
    UPDATE dbcpsc_admin_cc.tbmedicines SET qty = qty + ? WHERE med_id = ?
  `;
  const insertDetail = `
    INSERT INTO dbcpsc_admin_cc.tbimport_detail (im_id, med_id, expired_date, qty)
    VALUES (?, ?, ?, ?)
  `;
  const updateImport = `
    UPDATE dbcpsc_admin_cc.tbimport
    SET file = ?, preorder_id = ?, note = ?, im_date = ?
    WHERE im_id = ?
  `;

  const im_date = moment().format("YYYY-MM-DD HH:mm:ss");

  try {
    // Step 1: Reverse old stock
    db.query(selectOldDetails, [id], (err, oldResults) => {
      if (err) return res.status(500).json({ message: "Failed to fetch old details", error: err.message });

      // Subtract old stock
      const adjustPromises = oldResults.map((item) => {
        return new Promise((resolve, reject) => {
          db.query(updateStock, [-item.qty, item.med_id], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });

      Promise.all(adjustPromises)
        .then(() => {
          // Step 2: Delete old details
          db.query(deleteOldDetails, [id], (err) => {
            if (err) return res.status(500).json({ message: "Failed to delete old details", error: err.message });

            // Step 3: Update tbimport
            db.query(updateImport, [file, preorder_id, note, im_date, id], (err) => {
              if (err) return res.status(500).json({ message: "Failed to update import", error: err.message });

              // Step 4: Insert new details + Update stock
              const insertPromises = details.map((item) => {
                return new Promise((resolve, reject) => {
                  db.query(insertDetail, [id, item.med_id, item.expired_date, item.qty], (err) => {
                    if (err) return reject(err);
                    db.query(updateStock, [item.qty, item.med_id], (err) => {
                      if (err) return reject(err);
                      resolve();
                    });
                  });
                });
              });

              Promise.all(insertPromises)
                .then(() => {
                  res.status(200).json({
                    message: "Import updated successfully and stock adjusted.",
                    importId: id,
                  });
                })
                .catch((err) => {
                  res.status(500).json({ message: "Failed to update new details or stock", error: err.message });
                });
            });
          });
        })
        .catch((err) => {
          res.status(500).json({ message: "Failed to reverse old stock", error: err.message });
        });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

