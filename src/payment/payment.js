const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");
const jwt = require("../auth/jwt")

router.post("/payment", async (req, res) => {
    const data = req.body;
    const { invoice_id, paid_amount, pay_type, ex_id, ex_rate } = data
    // console.log(data)
    if (!data) {
        return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
    }

    const pay_date = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
    const status = "SUCCESS";

    const insert_Payment = `
    INSERT INTO Payment (pay_date, paid_amount, pay_type, ex_id, ex_rate, status, invoice_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    try {
        db.query(insert_Payment, [pay_date, paid_amount, pay_type, ex_id, ex_rate, status, invoice_id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "No invoice found" });
            }

            res.status(200).json({
                resultCode: "200",
                message: "Insert successful",
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



module.exports = router;