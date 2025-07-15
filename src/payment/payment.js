const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");
const jwt = require("../auth/jwt");

// router.post("/payment", async (req, res) => {
//   const data = req.body;
//   const { invoice_id, paid_amount, pay_type, ex_id, ex_rate } = data;

//   if (!data) {
//     return res
//       .status(400)
//       .json({ resultCode: "400", message: "Data is empty!" });
//   }
//   const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); //  '024'
//   const pay_id = `PMT${moment().format("YYMMDDHHmmss")}${random}`;

//   const pay_date = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
//   const status = "SUCCESS";

//   const insert_Payment = `
//     INSERT INTO tbpayments (pay_id, pay_date, paid_amount, pay_type, ex_id, ex_rate, status, invoice_id)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//   const update_InvoiceStatus = `
//     UPDATE tbinvoice SET status = 'SUCCESS' WHERE invoice_id = ?
//   `;

//   try {
//     db.query(
//       insert_Payment,
//       [
//         pay_id,
//         pay_date,
//         paid_amount,
//         pay_type,
//         ex_id,
//         ex_rate,
//         status,
//         invoice_id,
//       ],
//       (err, result) => {
//         if (err) {
//           return res
//             .status(500)
//             .json({ message: "Database error", error: err.message });
//         }

//         db.query(update_InvoiceStatus, [invoice_id], (errUpdate) => {
//           if (errUpdate) {
//             return res.status(500).json({
//               message: "Error updating invoice status",
//               error: errUpdate.message,
//             });
//           }

//           res.status(200).json({
//             resultCode: "200",
//             message: "Insert and update successful",
//             data: {
//               pay_id,
//               pay_date,
//               invoice_id,
//               status: "SUCCESS",
//             },
//           });
//         });
//       }
//     );
//   } catch (error) {
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });


router.post("/payment", async (req, res) => {
  const data = req.body;
  const { invoice_id, paid_amount, pay_type, ex_id, ex_rate } = data;

  if (!data) {
    return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
  }

  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const pay_id = `PMT${moment().format("YYMMDDHHmmss")}${random}`;
  const pay_date = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
  const status = "SUCCESS";

  const insert_Payment = `
    INSERT INTO tbpayments (pay_id, pay_date, paid_amount, pay_type, ex_id, ex_rate, status, invoice_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const get_InvoiceTotal = `SELECT total FROM tbinvoice WHERE invoice_id = ?`;

  const get_PaymentsSum = `
    SELECT COALESCE(SUM(paid_amount), 0) as total_paid
    FROM tbpayments
    WHERE invoice_id = ?
  `;

  const update_InvoiceStatus = `
    UPDATE tbinvoice SET status = 'SUCCESS' WHERE invoice_id = ?
  `;

  try {
    db.query(
      insert_Payment,
      [
        pay_id,
        pay_date,
        paid_amount,
        pay_type,
        ex_id,
        ex_rate,
        status,
        invoice_id,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Database error", error: err.message });
        }

        // ตรวจสอบยอดก่อนอัปเดตสถานะ invoice
        db.query(get_InvoiceTotal, [invoice_id], (errInvoice, invoiceResults) => {
          if (errInvoice) {
            return res.status(500).json({ message: "Error fetching invoice total", error: errInvoice.message });
          }

          const invoiceTotal = Number(invoiceResults[0]?.total ?? 0);

          db.query(get_PaymentsSum, [invoice_id], (errSum, sumResults) => {
            if (errSum) {
              return res.status(500).json({ message: "Error fetching payments sum", error: errSum.message });
            }

            const totalPaid = Number(sumResults[0]?.total_paid ?? 0);

            if (totalPaid === invoiceTotal) {
              // อัปเดตสถานะเฉพาะเมื่อยอดครบ
              db.query(update_InvoiceStatus, [invoice_id], (errUpdate) => {
                if (errUpdate) {
                  return res.status(500).json({
                    message: "Error updating invoice status",
                    error: errUpdate.message,
                  });
                }

                return res.status(200).json({
                  resultCode: "200",
                  message: "Insert payment and update invoice SUCCESS",
                  data: {
                    pay_id,
                    pay_date,
                    invoice_id,
                    total: invoiceTotal,
                    total_paid: totalPaid,
                    status: "SUCCESS",
                  },
                });
              });
            } else {
              // ไม่อัปเดต invoice เพราะยอดยังไม่ครบ
              return res.status(200).json({
                resultCode: "200",
                message: "Payment recorded, waiting full payment to update invoice",
                data: {
                  pay_id,
                  pay_date,
                  invoice_id,
                  total: invoiceTotal,
                  total_paid: totalPaid,
                  status: "WAITING",
                },
              });
            }
          });
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// router.post("/payment", async (req, res) => {
//   const data = req.body;
//   const { invoice_id, paid_amount, pay_type, ex_id, ex_rate } = data;
//   console.log(data);
//   if (!data) {
//     return res
//       .status(400)
//       .json({ resultCode: "400", message: "Data is empty!" });
//   }
//   const pay_id = `PMT${moment().format("YYMMDDHHmmss")}`;
//   const pay_date = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
//   const status = "SUCCESS";

//   const insert_Payment = `
//     INSERT INTO tbpayments (pay_id, pay_date, paid_amount, pay_type, ex_id, ex_rate, status, invoice_id)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//   try {
//     db.query(
//       insert_Payment,
//       [
//         pay_id,
//         pay_date,
//         paid_amount,
//         pay_type,
//         ex_id,
//         ex_rate,
//         status,
//         invoice_id,
//       ],
//       (err, result) => {
//         if (err) {
//           return res
//             .status(500)
//             .json({ message: "Database error", error: err.message });
//         }

//         if (result.length === 0) {
//           return res.status(404).json({ message: "No invoice found" });
//         }

//         res.status(200).json({
//           resultCode: "200",
//           message: "Insert successful",
//           data: result[0],
//         });
//       }
//     );
//   } catch (error) {
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

router.get("/payment", (req, res) => {
  const { invoice_id } = req.query;

  let sql = "SELECT * FROM tbpayments";
  const params = [];

  if (invoice_id) {
    sql += " WHERE invoice_id = ?";
    params.push(invoice_id);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database error", error: err.message });
    }
    res.status(200).json({
      resultCode: "200",
      message: "Payments retrieved successfully",
      data: results,
    });
  });
});

module.exports = router;
