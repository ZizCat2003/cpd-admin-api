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
        FROM Invoice
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

router.get("/invoice/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
    }

    const select_Invoice = `
        SELECT invoice_id, date, status, total, in_id
        FROM Invoice
        WHERE invoice_id = ?
    `;

    const select_detail_inspection = `
    SELECT td.tre_id, td.ser_Id, s.ser_name, td.qty, td.price, (td.qty * td.price) as total, td.in_id
    FROM Test.tbtreat_detail td 
    JOIN Test.Services s on s.ser_Id  = td.ser_Id
    where td.in_id = ?`;

    const select_detail_prescription = `
    SELECT pre.pre_id, pre.med_id, med.med_name, (pre.qty * pre.price) as total, pre.in_id
    FROM Test.PrescriptionDetail pre 
    JOIN Test.Medicines med on med.med_id  = pre.med_id
    where pre.in_id = ?`;

    try {
        db.query(select_Invoice, [id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "No invoice found" });
            }

            const id_inspection = result[0].in_id

            db.query(select_detail_inspection, [id_inspection], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Database error (details)", error: err.message });
                }

                db.query(select_detail_prescription, [id_inspection], (err, resultsMed) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error (Medicine)", error: err.message });
                    }

                    const invoice = result[0];
                    invoice.services = results.map(({ in_id, ...rest }) => rest);
                    invoice.medicines = resultsMed.map(({ in_id, ...rest }) => rest);

                    res.status(200).json({
                        resultCode: "200",
                        message: "Fetch successful",
                        data: invoice,
                    });
                })
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