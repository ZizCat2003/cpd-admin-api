// invoice.js
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/invoice/:patient_id", async (req, res) => {
  const { patient_id } = req.params;

  const sql = `SELECT * FROM tbinvoice WHERE patient_id = ? ORDER BY date DESC`;

  try {
    db.query(sql, [patient_id], (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }

      res.status(200).json({
        resultCode: "200",
        message: "Fetch invoice successful",
        data: results,
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/invoice", async (req, res) => {
  const { patient_id, items, in_id, emp_id_create } = req.body;

  if (
    !patient_id ||
    !items ||
    !Array.isArray(items) ||
    !in_id ||
    !emp_id_create
  ) {
    return res.status(400).json({ message: "Missing or invalid input" });
  }

  const invoice_id = `INV${moment().format("DDMMYYHHmmss")}`;
  const date = moment().format("YYYY-MM-DD HH:mm:ss");
  const total_amount = items.reduce(
    (sum, item) => sum + item.qty * item.unit_price,
    0
  );

  const insertInvoiceSQL = `
    INSERT INTO tbinvoice (invoice_id, date, status, in_id, emp_id_create)
    VALUES (?, ?, 'PAID', ?, ?)
  `;

  const insertPaymentSQL = `
    INSERT INTO tbpayments (pay_id, ex_id, invoice_id, pay_date, pay_amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const updateStatusSQL = `
    UPDATE tbinspection SET status = 'SUCCESS' WHERE in_id = ?
  `;

  try {
    // Insert invoice
    db.query(
      insertInvoiceSQL,
      [invoice_id, date, in_id, emp_id_create],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error inserting invoice", error: err.message });
        }

        // Insert payment details
        items.forEach((item, index) => {
          const pay_id = `PAY${moment().format("DDMMYYHHmmss")}${index}`;
          const pay_date = date;
          const pay_amount = item.qty * item.unit_price;
          const status = "PAID";

          db.query(
            insertPaymentSQL,
            [pay_id, item.ex_id, invoice_id, pay_date, pay_amount, status],
            (err2) => {
              if (err2) {
                console.error("Payment insert error:", err2.message);
              }
            }
          );
        });

        // Update inspection status
        db.query(updateStatusSQL, [in_id], (err3) => {
          if (err3) {
            return res.status(500).json({
              message: "Error updating patient status",
              error: err3.message,
            });
          }

          res.status(201).json({
            resultCode: "201",
            message: "Invoice created and patient status updated successfully",
            data: {
              invoice_id,
              date,
              total_amount,
              patient_id,
              in_id,
              items,
            },
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.put("/invoice/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Missing invoice status" });
  }

  const sql = `UPDATE tbinvoice SET status = ? WHERE invoice_id = ?`;

  try {
    db.query(sql, [status, id], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }

      res.status(200).json({
        resultCode: "200",
        message: "Invoice status updated successfully",
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
