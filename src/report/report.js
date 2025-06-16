const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/patient/:id", async (req, res) => {
  const { id } = req.params;

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
  const { id } = req.params;

  const select_detail_inspection = `
    SELECT td.tre_id, td.ser_Id, s.ser_name, td.qty, td.price, (td.qty * td.price) as total, td.in_id
    FROM tbtreat_detail td 
    JOIN tbservices s on s.ser_Id  = td.ser_Id
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
        detail: detail,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});


// router.get("/prescription/:id", async (req, res) => {
//   const { id } = req.params;

//   const select_detail_prescription = `
//     SELECT pre.pre_id, pre.med_id, med.med_name, (pre.qty * pre.price) as total, pre.in_id
//     FROM tbpresecriptiondetail pre 
//     JOIN tbmedicines med on med.med_id  = pre.med_id
//     where pre.in_id = ?`;

//   try {
//     db.query(select_detail_prescription, [id], async (err, results) => {
//       if (err) {
//         return res.status(500).json({
//           message: "Server error",
//           error: err.message,
//         });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ message: "No patient found" });
//       }

//       const detail = results;

//       res.status(200).json({
//         resultCode: "200",
//         message: "Fetch successful",
//         detail: detail,
//       });
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

router.get("/prescription/:id", async (req, res) => {
  const { id } = req.params;
  const { medtype_id } = req.query; 

  let select_detail_prescription = `
    SELECT pre.pre_id, pre.med_id, med.med_name, (pre.qty * pre.price) as total, pre.in_id
    FROM tbpresecriptiondetail pre 
    JOIN tbmedicines med on med.med_id = pre.med_id
    WHERE pre.in_id = ?`;

  const params = [id];

  if (medtype_id && medtype_id !== "") {
    select_detail_prescription += ` AND med.medtype_id = ?`;
    params.push(medtype_id);
  }

  try {
    db.query(select_detail_prescription, params, async (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Server error",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      res.status(200).json({
        resultCode: "200",
        message: "Fetch successful",
        detail: results,
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
    FROM tbinspection ins
    JOIN tbpatient p`;

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
        detail: detail,
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
  try {
    const { id } = req.query;
    const cate_type = id ? id.toString().toUpperCase() : null;

    let query = `
      SELECT 
        p.med_id,
        m.med_name,
        SUM(p.qty) AS qty,
        MAX(m.price) AS price
      FROM 
        tbpresecriptiondetail p
      JOIN 
        tbmedicines m ON p.med_id = m.med_id
    `;

    const params = [];

    if (cate_type && cate_type !== "") {
      query += ` WHERE m.medtype_id = ?`;
      params.push(cate_type);
    }

    query += ` GROUP BY p.med_id, m.med_name ORDER BY p.med_id ASC`;

    db.query(query, params, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Server error",
          error: err.message,
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      res.status(200).json({
        resultCode: "200",
        message: "Fetch successful",
        detail: results,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// router.get("/prescription", async (req, res) => {
//   const select_prescription = `
//     SELECT 
//     ROW_NUMBER() OVER (ORDER BY p.med_id) AS id,
//     p.med_id, 
//     m.med_name, 
//     SUM(p.qty) AS total
//     FROM 
//     tbpresecriptiondetail p
//     JOIN 
//     tbmedicines m ON p.med_id = m.med_id
//     GROUP BY 
//     p.med_id, m.med_name;`;

//   try {
//     db.query(select_prescription, async (err, results) => {
//       if (err) {
//         return res.status(500).json({
//           message: "Server error",
//           error: err.message,
//         });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ message: "No patient found" });
//       }

//       const detail = results;

//       res.status(200).json({
//         resultCode: "200",
//         message: "Fetch successful",
//         detail: detail,
//       });
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

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
    tbmedicines;`;

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
        detail: detail,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
// ----------------------------- Payment Report---
router.get("/payment", (req, res) => {
  const query = `
    SELECT 
  p.pay_id,
  ins.in_id,
  ins.date,
  p.status AS payment_status,
  p.pay_date,
  p.paid_amount,
  p.pay_type
FROM tbpayments p
JOIN tbinvoice i ON p.invoice_id = i.invoice_id
JOIN tbinspection ins ON i.in_id = ins.in_id

  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        resultCode: "500",
        message: "Database error",
        error: err.message,
      });
    }

    res.status(200).json({
      resultCode: "200",
      message: "Payments retrieved successfully",
      data: results,
    });
  });
});
// ----------------------------- Payment Report---

router.get("/appointment", (req, res) => {
  const query = `
    SELECT 
      p.patient_id,
      p.patient_name,
      p.patient_surname,
      a.date_addmintted,
      a.status
    FROM tbappointment a
    JOIN tbpatient p ON a.patient_id = p.patient_id
    ORDER BY a.date_addmintted DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "ບໍ່ສາມາດດຶງລາຍງານນັດໝາຍ ❌",
        details: err,
      });
    }
    res.status(200).json({
      message: "ລາຍງານນັດໝາຍສຳເລັດ ✅",
      data: results,
    });
  });
});

module.exports = router;
