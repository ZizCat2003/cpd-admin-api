const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");
const jwt = require("../auth/jwt")

router.post("/invoice", async (req, res) => {
    const data = req.body;
    const { total, in_id } = data

    if (!data) {
        return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
    }


    const invoice_id = `INV${moment().format("YYMMDDHHmmss")}`;
    const invoice_date = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
    const status = "UNPAID";

    const insert_Invoice = `INSERT INTO Invoice (invoice_id, date, status, total,  in_id) VALUES (?, ?, ?, ?, ?)`;

    try {
        db.query(insert_Invoice, [invoice_id, invoice_date, status, total, in_id], (err, result) => {
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

router.put("/cancel/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
    }

    const status = "CANCEL";

    const insert_Invoice = `UPDATE Invoice SET status = ? WHERE invoice_id = ?`;

    try {
        db.query(insert_Invoice, [status, id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
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
        FROM Test.Invoice
    `;

    try {
        db.query(select_Invoice, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "No invoice found" });
            }

            res.status(200).json({
                resultCode: "200",
                message: "Fetch successful",
                data: result,
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