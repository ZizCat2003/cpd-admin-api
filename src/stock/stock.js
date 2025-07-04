const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");


router.post("/checkstock", async (req, res) => {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ resultCode: "400", message: "Data is empty!" });
    }

    const select_Stock = `SELECT qty FROM tbmedicines WHERE med_id = ?`;
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



// router.post("/prescription/:id", async (req, res) => {
//     const { id } = req.params;
//     const { data } = req.body;

//     if (!data || !Array.isArray(data)) {
//         return res.status(400).json({ resultCode: "400", message: "Missing or invalid 'data' array" });
//     }

//     const insert_Prescription = `INSERT INTO tbpresecriptiondetail (med_id, qty, price, in_id) VALUES (?, ?, ?, ?)`;

//     const update_Stock = `UPDATE tbmedicines SET qty = qty - ? WHERE med_id = ?`;

//     try {

//         for (let i = 0; i < data.length; i++) {
//             const { med_id, med_qty, price } = data[i];

//             await new Promise((resolve, reject) => {
//                 db.query(insert_Prescription, [med_id, med_qty, price, id], (err, result) => {
//                     if (err) return reject(err);
//                     resolve(result);
//                 });
//             });

//             await new Promise((resolve, reject) => {
//                 db.query(update_Stock, [med_qty, med_id], (err, result) => {
//                     if (err) return reject(err);
//                     resolve(result);
//                 });
//             });
//         }

//         res.status(200).json({
//             resultCode: "200",
//             message: "Insert and update stock successful",
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: "Server error",
//             error: error.message,
//         });
//     }
// });

// ໂຕຫລັກ
// router.post("/prescription/:id", async (req, res) => {
//     const { id } = req.params;
//     const { data } = req.body;

//     if (!data || !Array.isArray(data)) {
//         return res.status(400).json({ resultCode: "400", message: "Missing or invalid 'data' array" });
//     }

//     const checkExists = `SELECT qty FROM tbpresecriptiondetail WHERE med_id = ? AND in_id = ?`;
//     const updatePrescription = `UPDATE tbpresecriptiondetail SET qty = ?, price = ? WHERE med_id = ? AND in_id = ?`;
//     const insertPrescription = `INSERT INTO tbpresecriptiondetail (med_id, qty, price, in_id) VALUES (?, ?, ?, ?)`;
//     const updateStock = `UPDATE tbmedicines SET qty = qty + ? WHERE med_id = ?`;

//     try {
//         for (const item of data) {
//             const { med_id, med_qty, price } = item;

//             // 1. Check if prescription already exists
//             const existing = await new Promise((resolve, reject) => {
//                 db.query(checkExists, [med_id, id], (err, results) => {
//                     if (err) return reject(err);
//                     resolve(results.length > 0 ? results[0].qty : null); // return old qty or null
//                 });
//             });

//             if (existing !== null) {
//                 const diff = existing - med_qty; // existing - new
//                 // Apply difference to medicine stock
//                 await new Promise((resolve, reject) => {
//                     db.query(updateStock, [diff, med_id], (err) => {
//                         if (err) return reject(err);
//                         resolve();
//                     });
//                 });

//                 // Update prescription
//                 await new Promise((resolve, reject) => {
//                     db.query(updatePrescription, [med_qty, price, med_id, id], (err) => {
//                         if (err) return reject(err);
//                         resolve();
//                     });
//                 });
//             } else {
//                 // Insert new
//                 await new Promise((resolve, reject) => {
//                     db.query(insertPrescription, [med_id, med_qty, price, id], (err) => {
//                         if (err) return reject(err);
//                         resolve();
//                     });
//                 });

//                 // Decrease stock
//                 await new Promise((resolve, reject) => {
//                     db.query(updateStock, [-med_qty, med_id], (err) => {
//                         if (err) return reject(err);
//                         resolve();
//                     });
//                 });
//             }
//         }

//         res.status(200).json({
//             resultCode: "200",
//             message: "Prescription and stock updated successfully",
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: "Server error",
//             error: error.message,
//         });
//     }
// });

// ໂຕໃໝ່
router.post("/prescription/:id", async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ resultCode: "400", message: "Missing or invalid 'data' array" });
    }

    const checkExists = `SELECT qty FROM tbpresecriptiondetail WHERE med_id = ? AND in_id = ?`;
    const updatePrescription = `UPDATE tbpresecriptiondetail SET qty = ?, price = ? WHERE med_id = ? AND in_id = ?`;
    const insertPrescription = `INSERT INTO tbpresecriptiondetail (med_id, qty, price, in_id) VALUES (?, ?, ?, ?)`;
    const updateStock = `UPDATE tbmedicines SET qty = qty + ? WHERE med_id = ?`;
    const getExistingPrescriptions = `SELECT med_id, qty FROM tbpresecriptiondetail WHERE in_id = ?`;
    const deletePrescription = `DELETE FROM tbpresecriptiondetail WHERE med_id = ? AND in_id = ?`;

    try {
        const incomingMedIds = data.map(item => item.med_id);

        // 🧠 Get all existing prescriptions to find what should be deleted
        const existingPrescriptions = await new Promise((resolve, reject) => {
            db.query(getExistingPrescriptions, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results); // [{med_id: 'M001', qty: 4}, ...]
            });
        });

        // ✅ Insert or update prescriptions
        for (const item of data) {
            const { med_id, med_qty, price } = item;

            const existingQty = await new Promise((resolve, reject) => {
                db.query(checkExists, [med_id, id], (err, results) => {
                    if (err) return reject(err);
                    resolve(results.length > 0 ? results[0].qty : null);
                });
            });

            if (existingQty !== null) {
                const diff = existingQty - med_qty;
                await new Promise((resolve, reject) => {
                    db.query(updateStock, [diff, med_id], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(updatePrescription, [med_qty, price, med_id, id], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            } else {
                await new Promise((resolve, reject) => {
                    db.query(insertPrescription, [med_id, med_qty, price, id], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(updateStock, [-med_qty, med_id], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }
        }

        // ✅ Delete prescriptions that are missing in new data
        for (const existing of existingPrescriptions) {
            if (!incomingMedIds.includes(existing.med_id)) {
                // Restore stock with deleted qty
                await new Promise((resolve, reject) => {
                    db.query(updateStock, [existing.qty, existing.med_id], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(deletePrescription, [existing.med_id, id], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }
        }

        res.status(200).json({
            resultCode: "200",
            message: "Prescription and stock updated successfully (added, updated, and deleted)",
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

module.exports = router;