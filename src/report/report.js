const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../../db");

router.get("/patient/:id", async (req, res) => {
  const { id } = req.params;

  const select_patient = `SELECT * FROM tbpatient WHERE patient_id = ?`;
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
router.get("/patient", async (req, res) => {
  const select_patients = `SELECT * FROM tbpatient ORDER BY patient_id`;

  try {
    db.query(select_patients, (err, results) => {
      if (err) {
        return res.status(500).json({
          resultCode: "500",
          message: "Server error",
          error: err.message,
        });
      }

      res.status(200).json({
        resultCode: "200",
        message: "Fetch successful",
        data: results,
      });
    });
  } catch (error) {
    return res.status(500).json({
      resultCode: "500",
      message: "Server error",
      error: error.message,
    });
  }
});
// router.get("/inspection/:id", async (req, res) => {
//   const { id } = req.params;

//   const select_detail_inspection = `
//     SELECT td.tre_id, td.ser_id, s.ser_name, td.qty, td.price, (td.qty * td.price) as total, td.in_id
//     FROM tbtreat_detail td
//     JOIN tbservice s on s.ser_Id  = td.ser_Id
//     where td.in_id = ?`;

//   try {
//     db.query(select_detail_inspection, [id], async (err, results) => {
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
const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const getInspectionWithPatient = (in_id) => {
  const sql = `
    SELECT 
      i.in_id,
      i.patient_id,
      p.patient_name,
      i.date,
      i.diseases_now,
      i.symptom,
      i.checkup,
      i.diseases,
      i.note
    FROM 
      tbinspection i
    JOIN 
      tbpatient p ON i.patient_id = p.patient_id
    WHERE 
      i.in_id = ?
  `;
  return queryAsync(sql, [in_id]);
};

const getInspectionDetails = (in_id) => {
  const sql = `
    SELECT 
      td.tre_id,
      td.ser_id,
      s.ser_name,
      td.qty,
      td.price,
      (td.qty * td.price) as total,
      td.in_id
    FROM 
      tbtreat_detail td 
    JOIN 
      tbservice s ON s.ser_id = td.ser_id
    WHERE 
      td.in_id = ?
  `;
  return queryAsync(sql, [in_id]);
};

const getAllMedicineDetails = (in_id) => {
  const sql = `
    SELECT 
      pre.pre_id, 
      pre.med_id, 
      med.med_name,
      (pre.qty * pre.price) as total, 
      med.medtype_id,
      mtype.type_name, 
      pre.in_id
    FROM 
      tbpresecriptiondetail pre 
    JOIN 
      tbmedicines med ON med.med_id = pre.med_id
    JOIN 
      tbmedicinestype mtype ON mtype.medtype_id = med.medtype_id
    WHERE 
      pre.in_id = ?
  `;
  return queryAsync(sql, [in_id]);
};

router.get("/inspection/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [inspection] = await getInspectionWithPatient(id);
    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }

    const services = await getInspectionDetails(id);
    const medicines = await getAllMedicineDetails(id);

    res.status(200).json({
      resultCode: "200",
      message: "Inspection with details fetched",
      data: {
        ...inspection,
        services,
        medicines,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/inspection", async (req, res) => {
  try {
    const inspections = await getAllInspections();

    const results = await Promise.all(
      inspections.map(async (inspection) => {
        const services = await getInspectionDetails(inspection.in_id);
        const medicines = await getAllMedicineDetails(inspection.in_id);

        return {
          ...inspection,
          services,
          medicines,
        };
      })
    );

    res.status(200).json({
      resultCode: "200",
      message: "All inspections fetched successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

const getAllInspections = () => {
  const sql = `
    SELECT 
      i.in_id,
      i.patient_id,
      p.patient_name,
      i.date,
      i.diseases_now,
      i.symptom,
      i.checkup,
      i.note
    FROM 
      tbinspection i
    JOIN 
      tbpatient p ON i.patient_id = p.patient_id
    ORDER BY i.date DESC
  `;
  return queryAsync(sql);
};

router.get("/prescription", async (req, res) => {
  const { id, med_type } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Missing required parameter: id" });
  }

  // Base SQL
  let select_detail_prescription = `
    SELECT 
      pre.pre_id, 
      pre.med_id, 
      med.med_name,
      pre.qty, 
      pre.price,
      (pre.qty * pre.price) as total, 
      med.medtype_id,
      mtype.type_name, 
      pre.in_id
    FROM 
      tbpresecriptiondetail pre 
    JOIN 
      tbmedicines med ON med.med_id = pre.med_id
    JOIN 
      tbmedicinestype mtype ON mtype.medtype_id = med.medtype_id
    WHERE 
      pre.in_id = ?
  `;

  const params = [id];

  if (med_type) {
    select_detail_prescription += " AND med.medtype_id = ?";
    params.push(med_type);
  }

  try {
    db.query(select_detail_prescription, params, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Server error",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No prescription details found" });
      }

      return res.status(200).json({
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

// router.get("/inspection", async (req, res) => {
//   const select_inspection = `
//     SELECT
//       ins.in_id,
//       ins.date,
//       ins.patient_id,
//       p.patient_name,
//       p.patient_surname,
//       p.gender,
//       ins.diseases_now,
//       ins.symptom,
//       ins.note,
//       ins.status,
//       ins.diseases,
//       ins.checkup
//     FROM tbinspection ins
//     JOIN tbpatient p ON ins.patient_id = p.patient_id
//     ORDER BY ins.date DESC`;

//   try {
//     db.query(select_inspection, async (err, results) => {
//       if (err) {
//         console.error('Database error:', err);
//         return res.status(500).json({
//           message: "Server error",
//           error: err.message,
//         });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({
//           message: "No inspection records found",
//           detail: []
//         });
//       }

//       const detail = results.map(row => ({
//         in_id: row.in_id,
//         date: row.date,
//         patient_id: row.patient_id,
//         patient_name: row.patient_name,
//         patient_surname: row.patient_surname || '',
//         gender: row.gender || '',
//         diseases_now: row.diseases_now || '',
//         symptom: row.symptom || '',
//         note: row.note || '',
//         status: row.status || '',
//         diseases: row.diseases,
//         checkup: row.checkup || ''
//       }));

//       res.status(200).json({
//         resultCode: "200",
//         message: "Fetch successful",
//         count: detail.length,
//         detail: detail,
//       });
//     });
//   } catch (error) {
//     console.error('Server error:', error);
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });
// router.get("/inspection", async (req, res) => {
//   const select_inspection = `
//     SELECT ins.in_id, ins.date, ins.patient_id, p.patient_name, ins.diseases_now, ins.symptom, ins.note, ins.status, ins.diseases, ins.checkup
//     FROM tbinspection ins
//     JOIN tbpatient p`;

//   try {
//     db.query(select_inspection, async (err, results) => {
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

// router.get("/prescription", async (req, res) => {
//   try {
//     const { id } = req.query;
//     const cate_type = id ? id.toString().toUpperCase() : null;

//     let query = `
//       SELECT
//         p.med_id,
//         m.med_name,
//         SUM(p.qty) AS qty,
//         MAX(m.price) AS price
//       FROM
//         tbpresecriptiondetail p
//       JOIN
//         tbmedicines m ON p.med_id = m.med_id
//     `;

//     const params = [];

//     if (cate_type && cate_type !== "") {
//       query += ` WHERE m.medtype_id = ?`;
//       params.push(cate_type);
//     }

//     query += ` GROUP BY p.med_id, m.med_name ORDER BY p.med_id ASC`;

//     db.query(query, params, (err, results) => {
//       if (err) {
//         return res.status(500).json({
//           message: "Server error",
//           error: err.message,
//         });
//       }

//       if (!results || results.length === 0) {
//         return res.status(404).json({ message: "No data found" });
//       }

//       res.status(200).json({
//         resultCode: "200",
//         message: "Fetch successful",
//         detail: results,
//       });
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

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

router.get("/preorder", (req, res) => {
  const sql = `
    SELECT 
      p.preorder_id,
      p.preorder_date,
      p.status,
      p.sup_id,
      p.emp_id_create,
      GROUP_CONCAT(DISTINCT mt.type_name ORDER BY mt.type_name) AS types
    FROM tbpreorder p
    LEFT JOIN tbpreorder_detail d ON d.preorder_id = p.preorder_id
    LEFT JOIN tbmedicines m ON m.med_id = d.med_id
    LEFT JOIN tbmedicinestype mt ON mt.medtype_id = m.medtype_id
    GROUP BY p.preorder_id
    ORDER BY p.preorder_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Get preorder failed", details: err });
    res.status(200).json({ data: results });
  });
});

router.get("/import", (req, res) => {
  const query = `
    SELECT 
  i.im_id,
  i.im_date,
  i.preorder_id,
  i.file,
  i.emp_id_create,
  i.note,
  GROUP_CONCAT(DISTINCT mt.type_name ORDER BY mt.type_name) AS types
FROM tbimport i
LEFT JOIN tbimport_detail d ON d.im_id = i.im_id
LEFT JOIN tbmedicines m ON m.med_id = d.med_id
LEFT JOIN tbmedicinestype mt ON mt.medtype_id = m.medtype_id
GROUP BY i.im_id
ORDER BY i.im_date DESC

  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "Get import failed",
        details: err.message,
      });
    }
    res.status(200).json({ data: results });
  });
});

router.get("/import", (req, res) => {
  const query = `
    SELECT 
  i.im_id,
  i.im_date,
  i.preorder_id,
  i.emp_id_create,
  GROUP_CONCAT(DISTINCT mt.type_name ORDER BY mt.type_name) AS types
FROM tbimport i
LEFT JOIN tbimport_detail d ON d.im_id = i.im_id
LEFT JOIN tbmedicines m ON m.med_id = d.med_id
LEFT JOIN tbmedicinestype mt ON mt.medtype_id = m.medtype_id
GROUP BY i.im_id

  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "Get import failed",
        details: err.message,
      });
    }
    res.status(200).json({ data: results });
  });
});

router.get("/preorder", (req, res) => {
  const query = `
  SELECT 
  p.preorder_id,
  p.preorder_date,
  p.sup_id,
  p.emp_id_create,
  GROUP_CONCAT(DISTINCT mt.type_name ORDER BY mt.type_name) AS types
FROM tbpreorder p
LEFT JOIN tbpreorder_detail d ON d.preorder_id = p.preorder_id
LEFT JOIN tbmedicines m ON m.med_id = d.med_id
LEFT JOIN tbmedicinestype mt ON mt.medtype_id = m.medtype_id
GROUP BY p.preorder_id


  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        error: "Get preorder failed",
        details: err.message,
      });
    }
    res.status(200).json({ data: results });
  });
});
module.exports = router;
