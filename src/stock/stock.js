const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");


router.post("/checkstock", async (req, res) => {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
    }

    const select_Stock = `SELECT qty FROM Medicines WHERE med_id = ?`;
    const insufficientStockItems = [];

    try {
        for (let i = 0; i < data.length; i++) {
            const { med_id, med_qty } = data[i];

            const stockResult = await new Promise((resolve, reject) => {
                db.query(select_Stock, [med_id], (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]);
                });
            });

            if (!stockResult || stockResult.qty < med_qty) {
                insufficientStockItems.push({
                    med_id,
                    order_qty: med_qty,
                    available: stockResult ? stockResult.qty : 0,
                });
            }
        }

        if (insufficientStockItems.length > 0) {
            return res.status(400).json({
                resultCode: "400",
                message: "Some items have insufficient stock",
                stock: insufficientStockItems,
            });
        }

        return res.status(200).json({
            resultCode: "200",
            message: "All medicines have sufficient stock",
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});



router.post("/prescription/:id", async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ resultCode: "400", message: "Missing or invalid 'data' array" });
    }

    const insert_Prescription = `INSERT INTO PrescriptionDetail (med_id, qty, price, in_id) VALUES (?, ?, ?, ?)`;

    const update_Stock = `UPDATE Medicines SET qty = qty - ? WHERE med_id = ?`;

    try {

        for (let i = 0; i < data.length; i++) {
            const { med_id, med_qty, price } = data[i];

            await new Promise((resolve, reject) => {
                db.query(insert_Prescription, [med_id, med_qty, price, id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            await new Promise((resolve, reject) => {
                db.query(update_Stock, [med_qty, med_id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        }

        res.status(200).json({
            resultCode: "200",
            message: "Insert and update stock successful",
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

module.exports = router;