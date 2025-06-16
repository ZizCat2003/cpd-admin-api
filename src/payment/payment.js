const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");
const jwt = require("../auth/jwt");

router.post("/payment", async (req, res) => {
    const data = req.body;
    const { invoice_id, paid_amount, pay_type, ex_id, ex_rate } = data
    // console.log(data)
    if (!data) {
        return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
    }

    const insert_Payment = `
    INSERT INTO tbpayments (pay_id, pay_date, paid_amount, pay_type, ex_id, ex_rate, status, invoice_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

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
                    data: result[0],
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
