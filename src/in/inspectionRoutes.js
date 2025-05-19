const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/inspection", async (req, res) => {
  const { patient_id } = req.body;

  if (!patient_id) {
    return res.status(400).json({ message: "Missing patient_id" });
  }

  const in_id = `PT${moment().format("DDMMYYHHmm")}`;
  const in_date = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
  const status = "WATTING";

  const sql = `
    INSERT INTO tbinspection (in_id, date, status, patient_id)
    VALUES (?, ?, ?, ?)
  `;

  try {
    db.query(sql, [in_id, in_date, status, patient_id], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      res.status(200).json({
        resultCode: "200",
        message: "Insert successful",
        data: {
          in_id,
          date: in_date,
          status,
          patient_id,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});


router.put("/inspection/:id", async (req, res) => {
  const { id } = req.params;
  const { diseases_now, symptom, note, detailed } = req.body;

  if (!detailed || !Array.isArray(detailed)) {
    return res.status(400).json({ message: "Missing or invalid 'detailed' array" });
  }

  const updateInspectionSQL = `
    UPDATE tbinspection
    SET diseases_now = ?, symptom = ?, note = ?
    WHERE in_id = ?
  `;

  try {
    // Update inspection
    await db.query(updateInspectionSQL, [
      diseases_now,
      symptom,
      note,
      id,
    ]);


    const insertDetailSQL = `
      INSERT INTO tbtreat_detail (in_id, ser_id, qty, price)
      VALUES (?, ?, ?, ?)
    `;

    for (const item of detailed) {
      const { ser_id, qty, price } = item;
      await db.query(insertDetailSQL, [id, ser_id, qty, price]);
    }

    detailed.forEach(element => {
      
    });

    res.status(200).json({
      resultCode: "200",
      message: "Update and insertion successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;