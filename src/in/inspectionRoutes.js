const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");
const jwt = require("../auth/jwt");


router.get("/inspection/:patient_id", async (req, res) => {
  const { patient_id } = req.params;

  if (!patient_id) {
    return res.status(400).json({ message: "Missing patient_id" });
  }

  const sql = `SELECT * FROM tbinspection WHERE patient_id = ? ORDER BY date DESC LIMIT 1`;

  try {
    db.query(sql, [patient_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No inspection found" });
      }

      res.status(200).json({
        resultCode: "200",
        message: "Fetch successful",
        data: results[0],
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/inspection", jwt.verify, async (req, res) => {
  const { patient_id } = req.body;
  const { id, username } = req.user;
  console.log(req.user)
  // const payload = { id, username, level: "normal" };
  // const token = jwt.sign(payload);
  // console.log(token);

  if (!patient_id) {
    return res.status(400).json({ message: "Missing patient_id" });
  }

  const in_id = `PT${moment().format("DDMMYYHHmmss")}`;
  const in_date = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
  const status = "WATTING";

  const sql = `
    INSERT INTO tbinspection (in_id, date, status, patient_id)
    VALUES (?, ?, ?, ?)
  `;

  try {
    // db.query(sql, [in_id, in_date, status, patient_id], (err, result) => {
    //   if (err) {
    //     return res.status(500).json({
    //       message: "Database error",
    //       error: err.message,
    //     });
    //   }

    //   res.status(200).json({
    //     resultCode: "200",
    //     message: "Insert successful",
    //     data: {
    //       in_id,
    //       date: in_date,
    //       status,
    //       patient_id,
    //     },
    //   });
    // });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.put("/inspection/:id", async (req, res) => {
  const { id } = req.params;
  const { diseases_now, symptom, checkup, note, detailed } = req.body;

  if (!detailed || !Array.isArray(detailed)) {
    return res.status(400).json({ resultCode: "400", message: "Missing or invalid 'detailed' array" });
  }

  const updateInspectionSQL = `
    UPDATE tbinspection
    SET diseases_now = ?, symptom = ?,  checkup = ?, note = ?
    WHERE in_id = ?
  `;

  const insertDetailSQL = `
    INSERT INTO tbtreat_detail (in_id, ser_id, qty, price)
    VALUES (?, ?, ?, ?)
  `;

  try {

    db.query(updateInspectionSQL, [diseases_now, symptom, checkup, note, id]);

    for (let i = 0; i < detailed.length; i++) {
      const { ser_id, qty, price } = detailed[i];
      db.query(insertDetailSQL, [id, ser_id, qty, price]);
    }

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