// serviceRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../../db");  // ใช้เส้นทาง ../ เพื่อไปยังไฟล์ db.js

// เพิ่ม endpoint สำหรับดึงรหัสล่าสุดของ PACKAGE
router.get("/servicelist/next-package-id", (req, res) => {
    const query = `
        SELECT ser_id FROM tbservice 
        WHERE ser_id LIKE 'SPK%' AND ispackage = 'PACKAGE'
        ORDER BY ser_id DESC 
        LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດ ❌", details: err });
        }
        
        let nextId = "SPK01"; // รหัสเริ่มต้น
        
        if (results.length > 0) {
            const lastId = results[0].ser_id;
            // ดึงเลขจากรหัสล่าสุด เช่น SPK001 -> 001
            const lastNumber = parseInt(lastId.substring(3));
            // เพิ่มเลข 1 และแปลงกลับเป็นรูปแบบ 3 หลัก
            const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
            nextId = `SPK${nextNumber}`;
        }
        
        res.status(200).json({ 
            message: "ດຶງລະຫັດຖັດໄປສຳເລັດ ✅", 
            nextId: nextId 
        });
    });
});

// เพิ่ม endpoint สำหรับดึงรหัสล่าสุดของบริการทั่วไป (NOT PACKAGE)
router.get("/servicelist/next-service-id", (req, res) => {
    const query = `
        SELECT ser_id FROM tbservice 
        WHERE ser_id LIKE 'S%' AND ser_id NOT LIKE 'SPK%' AND ispackage = 'NOT'
        ORDER BY ser_id DESC 
        LIMIT 1
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດ ❌", details: err });
        }
        
        let nextId = "S01"; // รหัسเริ่มต้น
        
        if (results.length > 0) {
            const lastId = results[0].ser_id;
            // ดึงเลขจากรหัสล่าสุด เช่น S001 -> 001
            const lastNumber = parseInt(lastId.substring(1));
            // เพิ่มเลข 1 และแปลงกลับเป็นรูปแบบ 3 หลัก
            const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
            nextId = `S${nextNumber}`;
        }
        
        res.status(200).json({ 
            message: "ດຶງລະຫັດຖັດໄປສຳເລັດ ✅", 
            nextId: nextId 
        });
    });
});

// เพิ่มบริการใหม่
router.post("/servicelist", (req, res) => {
    const {ser_id, ser_name, price, ispackage } = req.body;

    const query = `
        INSERT INTO tbservice (ser_id, ser_name, price, ispackage)
        VALUES (?, ?, ? , ?)
    `;

    db.query(query, [ser_id,ser_name, price, ispackage], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        res.status(201).json({ message: "ເພີ່ມບໍລິການສຳເລັດ ✅", service_id: result.insertId });
    });
});

// ดึงข้อมูลทั้งหมดของบริการ
router.get("/servicelist", (req, res) => {
    const query = "SELECT * FROM tbservice";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນບໍລິການສຳເລັດ ✅", data: results });
    });
});

// ดึงข้อมูลทั้งหมดของบริการ
router.get("/servicelistPACKAGE", (req, res) => {
    const query = "SELECT * FROM tbservice WHERE ispackage = 'PACKAGE'";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນບໍລິການສຳເລັດ ✅", data: results });
    });
});

// ดึงข้อมูลทั้งหมดของบริการ
router.get("/servicelistNOT", (req, res) => {
    const query = "SELECT * FROM tbservice WHERE ispackage = 'NOT'";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນບໍລິການສຳເລັດ ✅", data: results });
    });
});

// ดึงข้อมูลบริการตาม ID
router.get("/servicelist/:id", (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM tbservice WHERE ser_id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບ id ບໍລິການນີ້" });
        }
        res.status(200).json({ message: "ສະແດງຂໍ້ມູນບໍລິການສຳເລັດ ✅", data: results[0] });
    });
});

// แก้ไขข้อมูลบริการ
router.put("/servicelist/:id", (req, res) => {
    const { id } = req.params;
    const { ser_name, price, ispackage } = req.body;

    const query = `
        UPDATE tbservice
        SET ser_name = ?, price = ?, ispackage = ?
        WHERE ser_id = ?
    `;

    db.query(query, [ser_name, price, ispackage, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນບໍລິການ ❌", details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນບໍລິການນີ້" });
        }
        res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນບໍລິການສຳເລັດ ✅" });
    });
});

// DELETE
router.delete("/servicelist/:id", (req, res) => {
  db.query("DELETE FROM tbservice WHERE ser_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "ລົບຂໍ້ມູນບໍ່ສຳເລັດ ❌", details: err });
    res.status(200).json({ message: "ລຶບຂໍ້ມູນບໍລິການສຳເລັດ ✅" });
  });
});

module.exports = router;

// serviceRoutes.js

// const express = require("express");
// const router = express.Router();
// const db = require("../../db");  

// router.post("/servicelist", (req, res) => {
//     const { ser_id, ser_name, price, ispackage } = req.body;

//     const query = `
//         INSERT INTO tbservice (ser_id, ser_name, price, ispackage)
//         VALUES (?, ?, ?, ?)
//     `;

//     db.query(query, [ser_id, ser_name, price, ispackage], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນບໍລິການ ❌", details: err });
//         }
//         res.status(201).json({ message: "ເພີ່ມບໍລິການສຳເລັດ ✅", service_id: result.insertId });
//     });
// });

// router.get("/servicelist", (req, res) => {
//     const query = "SELECT * FROM tbservice";
//     db.query(query, (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນບໍລິການ ❌", details: err });
//         }
//         res.status(200).json({ message: "ສະແດງຂໍ້ມູນບໍລິການສຳເລັດ ✅", data: results });
//     });
// });

// router.get("/servicelist/:id", (req, res) => {
//     const { id } = req.params;

//     const query = "SELECT * FROM tbservice WHERE ser_id = ?";
//     db.query(query, [id], (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນບໍລິການ ❌", details: err });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ message: "ບໍ່ພົບ id ບໍລິການນີ້" });
//         }
//         res.status(200).json({ message: "ສະແດງຂໍ້ມູນບໍລິການສຳເລັດ ✅", data: results[0] });
//     });
// });
// router.put("/servicelist/:id", (req, res) => {
//     const { id } = req.params;
//     const { ser_name, price, ispackage } = req.body;

//     const query = `
//         UPDATE tbservice
//         SET ser_name = ?, price = ?, ispackage = ?
//         WHERE ser_id = ?
//     `;

//     db.query(query, [ser_name, price, ispackage, id], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນບໍລິການ ❌", details: err });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນບໍລິການນີ້" });
//         }
//         res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນບໍລິການສຳເລັດ ✅" });
//     });
// });


// router.delete("/servicelist/:id", (req, res) => {
//     const { id } = req.params;

//     const query = "DELETE FROM tbservice WHERE ser_id = ?";

//     db.query(query, [id], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດລຶບຂໍ້ມູນບໍລິການ ❌", details: err });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "ບໍ່ພົບ id ບໍລິການນີ້" });
//         }
//         res.status(200).json({ message: "ລຶບຂໍ້ມູນບໍລິການສຳເລັດ ✅" });
//     });
// });

// module.exports = router;
