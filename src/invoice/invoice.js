const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");
const jwt = require("../auth/jwt");


router.post("/invoice", async (req, res) => {
  const data = req.body;
  const { total, in_id } = data;

  if (!data) {
    return res
      .status(400)
      .json({ resultCode: "400", mestbinvoicesage: "Data is empty!" });
  }

  const invoice_id = `INV${moment().format("YYMMDDHHmmss")}`;
  const invoice_date = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
  const status = "UNPAID";

  const insert_Invoice = `INSERT INTO tbinvoice (invoice_id, date, status, total,  in_id) VALUES (?, ?, ?, ?, ?)`;

  try {
    db.query(
      insert_Invoice,
      [invoice_id, invoice_date, status, total, in_id],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Database error", error: err.message });
        }

        if (result.length === 0) {
          return res.status(404).json({ message: "No invoice found" });
        }

        res.status(200).json({
          resultCode: "200",
          message: "Insert successful",
          data: {
            invoice_id,
            invoice_date,
            status,
            total,
            in_id,
          },
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.put("/cancel/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ resultCode: "400", message: "Data is empty!" });
  }

  const status = "CANCEL";

  const insert_Invoice = `UPDATE tbinvoice SET status = ? WHERE invoice_id = ?`;

  try {
    db.query(insert_Invoice, [status, id], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }

      res.status(200).json({
        resultCode: "200",
        message: "Update successful",
        data: result[0],
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/invoice", async (req, res) => {
  const select_Invoice = `
    SELECT invoice_id, date, status, total, in_id
    FROM tbinvoice
    WHERE status != 'SUCCESS'
    ORDER BY invoice_id DESC
  `;

  const select_PaymentsSum = `
    SELECT COALESCE(SUM(paid_amount), 0) as total_paid
    FROM tbpayments
    WHERE invoice_id = ?
  `;

  try {
    db.query(select_Invoice, async (err, invoices) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      if (invoices.length === 0) {
        return res.status(404).json({ message: "No invoice found" });
      }

      const enrichedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          return new Promise((resolve) => {
            db.query(select_PaymentsSum, [invoice.invoice_id], (err, paymentsResult) => {
              const total_paid = paymentsResult?.[0]?.total_paid || 0;
              const total = invoice.total || 0;
              const balance = total - total_paid;

              resolve({
                ...invoice,
                balance
              });
            });
          });
        })
      );

      res.status(200).json({
        resultCode: "200",
        message: "Fetch successful",
        data: enrichedInvoices
      });

    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

router.get("/invoice/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
  }

  const select_Invoice = `
    SELECT invoice_id, date, status, total, in_id
    FROM tbinvoice
    WHERE invoice_id = ?
  `;

  const select_detail_inspection = `
    SELECT td.tre_id, td.ser_Id, s.ser_name, td.qty, td.price, (td.qty * td.price) as total, td.in_id
    FROM tbtreat_detail td 
    JOIN tbservice s on s.ser_Id = td.ser_Id
    WHERE td.in_id = ?
  `;

  const select_detail_prescription = `
    SELECT pre.pre_id, pre.med_id, pre.qty, pre.price, med.med_name, (pre.qty * pre.price) as total, pre.in_id
    FROM tbpresecriptiondetail pre 
    JOIN tbmedicines med on med.med_id = pre.med_id
    WHERE pre.in_id = ?
  `;

  const select_payments = `
    SELECT pay_id, ex_id, invoice_id, pay_date, paid_amount, status, pay_type, ex_rate
    FROM tbpayments
    WHERE invoice_id = ?
  `;

  try {
    db.query(select_Invoice, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "No invoice found" });
      }

      const invoice = result[0];
      const id_inspection = invoice.in_id;

      db.query(select_detail_inspection, [id_inspection], (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Database error (details)", error: err.message });
        }

        db.query(select_detail_prescription, [id_inspection], (err, resultsMed) => {
          if (err) {
            return res.status(500).json({ message: "Database error (Medicine)", error: err.message });
          }

          db.query(select_payments, [id], (err, resultsPay) => {
            if (err) {
              return res.status(500).json({ message: "Database error (Payments)", error: err.message });
            }

            const totalPaid = resultsPay.reduce((sum, p) => sum + (Number(p.paid_amount) || 0), 0);
            const newStatus = (totalPaid >= invoice.total) ? 'SUCCESS' : 'WAITING';

            invoice.status = newStatus;
            invoice.total_paid = totalPaid;
            invoice.balance = invoice.total - totalPaid;
            // invoice.total -= totalPaid
            invoice.payments = resultsPay;
            invoice.services = results.map(({ in_id, ...rest }) => rest);
            invoice.medicines = resultsMed.map(({ in_id, ...rest }) => rest);

            res.status(200).json({
              resultCode: "200",
              message: "Fetch successful",
              data: invoice,
            });
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/inspection-invoice/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
  }

  const select_Invoice = `
    SELECT invoice_id, date, status, total, in_id
    FROM tbinvoice
    WHERE in_id = ?
  `;

  const select_payments = `
    SELECT pay_id, ex_id, invoice_id, pay_date, paid_amount, status, pay_type, ex_rate
    FROM tbpayments
    WHERE invoice_id = ?
  `;

  try {
    db.query(select_Invoice, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "No invoice found" });
      }

      const invoice = result[0];
      const id_invoice = invoice.invoice_id;

      db.query(select_payments, [id_invoice], (err, resultsPay) => {
        if (err) {
          return res.status(500).json({ message: "Database error (Payments)", error: err.message });
        }

        const totalPaid = resultsPay.reduce((sum, p) => sum + (Number(p.paid_amount) || 0), 0);
        const newStatus = (totalPaid >= invoice.total) ? 'SUCCESS' : 'WAITING';

        invoice.status = newStatus;
        invoice.total_paid = totalPaid;
        invoice.payments = resultsPay;

        res.status(200).json({
          resultCode: "200",
          message: "Fetch successful",
          data: invoice,
        });
      });


    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
