const express = require("express");
const router = express.Router();
const moment = require("moment");
const { queryAsync } = require("../../helper/queryfunction");


router.get("/", async (req, res) => {
    try {
        const suppliers = await queryAsync(`
      SELECT sup_id, company_name, address, phone, status
      FROM dbcpsc_admin_cc.tbsupplier
    `);
        res.status(200).json({ message: "Fetched all suppliers", data: suppliers });
    } catch (error) {
        res.status(500).json({ message: "Error fetching suppliers", error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    const supId = req.params.id;
    try {
        const [supplier] = await queryAsync(`
      SELECT sup_id, company_name, address, phone, status
      FROM dbcpsc_admin_cc.tbsupplier
      WHERE sup_id = ?
    `, [supId]);

        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        res.status(200).json({ message: "Fetched supplier", data: supplier });
    } catch (error) {
        res.status(500).json({ message: "Error fetching supplier", error: error.message });
    }
});


router.post("/", async (req, res) => {
    const { company_name, address, phone } = req.body;

    if (!company_name) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const status_first = 'ACTIVE';

    try {
        const result = await queryAsync(`
      INSERT INTO dbcpsc_admin_cc.tbsupplier (company_name, address, phone, status)
      VALUES (?, ?, ?, ?)
    `, [company_name, address, phone, status_first]);

        res.status(200).json({ message: "Supplier created", sup_id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: "Error creating supplier", error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    const supId = req.params.id;
    const { company_name, address, phone, status } = req.body;

    try {
        const result = await queryAsync(`
      UPDATE dbcpsc_admin_cc.tbsupplier
      SET company_name = ?, address = ?, phone = ?, status = ?
      WHERE sup_id = ?
    `, [company_name, address, phone, status, supId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        res.status(200).json({ message: "Supplier updated", sup_id: supId });
    } catch (error) {
        res.status(500).json({ message: "Error updating supplier", error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    const supId = req.params.id;

    try {
        const result = await queryAsync(`
      DELETE FROM dbcpsc_admin_cc.tbsupplier
      WHERE sup_id = ?
    `, [supId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        res.status(200).json({ message: "Supplier deleted", sup_id: supId });
    } catch (error) {
        res.status(500).json({ message: "Error deleting supplier", error: error.message });
    }
});

module.exports = router;
