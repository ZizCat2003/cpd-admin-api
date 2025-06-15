const express = require("express");
const router = express.Router();
const db = require("../../db");


router.post('/appointment', (req, res) => {
    const { appoint_id, date_addmintted, status, description, emp_id, patient_id } = req.body;
  
    const query = `
      INSERT INTO tbappointment (appoint_id, date_addmintted, status, description, emp_id, patient_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    db.query(query, [appoint_id, date_addmintted, status, description, emp_id, patient_id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມນັດໝາຍ ❌", details: err });
      }
      res.status(201).json({ message: "ເພີ່ມນັດໝາຍສຳເລັດ ✅", appoint_id: appoint_id });
    });
  });
  


// ✅ ดึงนัดหมายทั้งหมด
router.get("/appointment", (req, res) => {
    const query = "SELECT * FROM tbappointment";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນນັດໝາຍ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນນັດໝາຍສຳເລັດ ✅", data: results });
    });
});

// ✅ ดึงนัดหมายตาม appoint_id
router.get("/appointment/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbappointment WHERE appoint_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນນັດໝາຍ ❌", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ສະແດງນັດໝາຍສຳເລັດ ✅", data: results[0] });
    });
});

router.put("/appointment/:id", (req, res) => {
    const { id } = req.params;
    const { date_addmintted, status, description, emp_id, patient_id } = req.body;

    const query = `
        UPDATE tbappointment
        SET date_addmintted = ?, status = ?, description = ?, emp_id = ?, patient_id = ?
        WHERE appoint_id = ?
    `;

    db.query(query, [date_addmintted, status, description, emp_id, patient_id, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂນັດໝາຍ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂນັດໝາຍສຳເລັດ ✅" });
    });
});

router.put("/appointmentS/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const query = `
        UPDATE tbappointment
        SET  status = ?
        WHERE appoint_id = ?
    `;

    db.query(query, [status, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂນັດໝາຍ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂນັດໝາຍສຳເລັດ ✅" });
    });
});

router.put("/appointmentD/:id", (req, res) => {
    const { id } = req.params;
    const { date_addmintted } = req.body;

    const query = `
        UPDATE tbappointment
        SET  date_addmintted = ?
        WHERE appoint_id = ?
    `;

    db.query(query, [date_addmintted, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂນັດໝາຍ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂນັດໝາຍສຳເລັດ ✅" });
    });
});


// ✅ ลบนัดหมาย
router.delete("/appointment/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM tbappointment WHERE appoint_id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດລຶບນັດໝາຍ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
        }
        res.status(200).json({ message: "ລຶບນັດໝາຍສຳເລັດ ✅" });
    });
});

module.exports = router;



// router.post("/appointment", (req, res) => {
//   const {
//     appoint_id,
//     date_addmintted,
//     status,
//     description,
//     emp_id,
//     patient_id,
//   } = req.body;

//   const query = `
//       INSERT INTO tbappointment (appoint_id, date_addmintted, status, description, emp_id, patient_id)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;
  
//   let dateObj = new Date(date_addmintted);
  
//   const hours = dateObj.getHours();
//   const minutes = dateObj.getMinutes();
  
//   const fixedDate = new Date(dateObj);
//   fixedDate.setHours(hours, minutes, 0, 0);
  
//   db.query(
//     query,
//     [appoint_id, fixedDate, status, description, emp_id, patient_id],
//     (err, result) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ error: "ບໍ່ສາມາດເພີ່ມນັດໝາຍ ❌", details: err });
//       }
//       res
//         .status(201)
//         .json({ message: "ເພີ່ມນັດໝາຍສຳເລັດ ✅", appoint_id: appoint_id });
//     }
//   );
// });
// router.get("/appointment", (req, res) => {
//   const query = "SELECT * FROM tbappointment";
//   db.query(query, (err, results) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນນັດໝາຍ ❌", details: err });
//     }
//     res
//       .status(200)
//       .json({ message: "ສະແດງຂໍ້ມູນນັດໝາຍສຳເລັດ ✅", data: results });
//   });
// });

// // ✅ ดึงนัดหมายตาม appoint_id
// router.get("/appointment/:id", (req, res) => {
//   const { id } = req.params;

//   const query = "SELECT * FROM tbappointment WHERE appoint_id = ?";
//   db.query(query, [id], (err, results) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນນັດໝາຍ ❌", details: err });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
//     }
//     res.status(200).json({ message: "ສະແດງນັດໝາຍສຳເລັດ ✅", data: results[0] });
//   });
// });
// router.put("/appointment/:id", (req, res) => {
//   const { id } = req.params;
//   const { date_addmintted, status, description, emp_id, patient_id } = req.body;

//   const query = `
//         UPDATE tbappointment
//         SET date_addmintted = ?, status = ?, description = ?, emp_id = ?, patient_id = ?
//         WHERE appoint_id = ?
//     `;

//   db.query(
//     query,
//     [date_addmintted, status, description, emp_id, patient_id, id],
//     (err, result) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ error: "ບໍ່ສາມາດແກ້ໄຂນັດໝາຍ ❌", details: err });
//       }
//       if (result.affectedRows === 0) {
//         return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
//       }
//       res.status(200).json({ message: "ແກ້ໄຂນັດໝາຍສຳເລັດ ✅" });
//     }
//   );
// });

// // ✅ ลบนัดหมาย
// router.delete("/appointment/:id", (req, res) => {
//   const { id } = req.params;

//   const query = "DELETE FROM tbappointment WHERE appoint_id = ?";
//   db.query(query, [id], (err, result) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ error: "ບໍ່ສາມາດລຶບນັດໝາຍ ❌", details: err });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "ບໍ່ພົບ appoint_id ນີ້" });
//     }
//     res.status(200).json({ message: "ລຶບນັດໝາຍສຳເລັດ ✅" });
//   });
// });

module.exports = router;
