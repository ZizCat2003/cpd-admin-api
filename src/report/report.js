const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/patient/:id", async (req, res) => {
    const { id } = req.params

    const select_patient = `SELECT * FROM Patient WHERE patient_id = ?`;
    const select_inspection = `SELECT * FROM tbinspection WHERE patient_id = ?`;

    try {
        db.query(select_patient, [id], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Server error",
                    error: err.message,
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No patient found" });
            }

            const patient = results[0];

            db.query(select_inspection, [id], async (err, results) => {
                if (err) {
                    return res.status(500).json({
                        message: "Server error",
                        error: err.message,
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: "No inspection found" });
                }

                const inspections = results;

                res.status(200).json({
                    resultCode: "200",
                    message: "Fetch successful",
                    data: {
                        patient: patient,
                        inspections: inspections,
                    },
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

router.get("/inspection/:id", async (req, res) => {
    const { id } = req.params

    const select_detail_inspection = `
    SELECT td.tre_id, td.ser_Id, s.ser_name, td.qty, td.price, (td.qty * td.price) as total, td.in_id
    FROM Test.tbtreat_detail td 
    JOIN Test.Services s on s.ser_Id  = td.ser_Id
    where td.in_id = ?`;

    try {
        db.query(select_detail_inspection, [id], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Server error",
                    error: err.message,
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No patient found" });
            }

            const detail = results;

            res.status(200).json({
                resultCode: "200",
                message: "Fetch successful",
                detail: detail
            });

        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

router.get("/prescription/:id", async (req, res) => {
    const { id } = req.params

    const select_detail_prescription = `
    SELECT pre.pre_id, pre.med_id, med.med_name, (pre.qty * pre.price) as total, pre.in_id
    FROM Test.PrescriptionDetail pre 
    JOIN Test.Medicines med on med.med_id  = pre.med_id
    where pre.in_id = ?`;

    try {
        db.query(select_detail_prescription, [id], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Server error",
                    error: err.message,
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No patient found" });
            }

            const detail = results;

            res.status(200).json({
                resultCode: "200",
                message: "Fetch successful",
                detail: detail
            });

        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

router.get("/inspection", async (req, res) => {

    const select_inspection = `
    SELECT ins.in_id, ins.date, ins.patient_id, p.patient_name, ins.diseases_now, ins.symptom, ins.note, ins.status, ins.diseases, ins.checkup
    FROM Test.tbinspection ins
    JOIN Test.Patient p`;

    try {
        db.query(select_inspection, async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Server error",
                    error: err.message,
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No patient found" });
            }

            const detail = results;

            res.status(200).json({
                resultCode: "200",
                message: "Fetch successful",
                detail: detail
            });

        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

router.get("/prescription", async (req, res) => {

    const select_prescription = `
    SELECT 
    ROW_NUMBER() OVER (ORDER BY p.med_id) AS id,
    p.med_id, 
    m.med_name, 
    SUM(p.qty) AS total
    FROM 
    Test.PrescriptionDetail p
    JOIN 
    Test.Medicines m ON p.med_id = m.med_id
    GROUP BY 
    p.med_id, m.med_name;`;

    try {
        db.query(select_prescription, async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Server error",
                    error: err.message,
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No patient found" });
            }

            const detail = results;

            res.status(200).json({
                resultCode: "200",
                message: "Fetch successful",
                detail: detail
            });

        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

router.get("/stock", async (req, res) => {

    const select_stock = `
    SELECT 
    med_id, 
    med_name, 
    qty, 
    CASE 
        WHEN qty > 0 THEN 'AVAILABLE'
        ELSE 'UNAVAILABLE'
    END AS status
    FROM 
    Test.Medicines;`;

    try {
        db.query(select_stock, async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Server error",
                    error: err.message,
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No patient found" });
            }

            const detail = results;

            res.status(200).json({
                resultCode: "200",
                message: "Fetch successful",
                detail: detail
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