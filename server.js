const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const patientRoutes = require("./src/manager/patientRoutes"); 
const medicinesRoutes = require("./src/manager/medicinesRoutes"); 
const categoryRoutes = require("./src/manager/categoryRoutes"); 
const serviceRoutes = require("./src/manager/serviceRoutes"); 
const exchangeRoutes = require("./src/manager/exchangeRoutes"); 
const diseaseRoutes = require("./src/manager/diseaseRoutes"); 
const supplierRoutes  = require("./src/manager/supplierRoutes"); 
const EmpRoutes   = require("./src/manager/EmpRoutes"); 
const inspection = require("./src/in/inspectionRoutes");

const packetRoutes = require('./src/manager/packetRoutes');
app.use('/src/manager/packet', packetRoutes);
const packetdetailRoutes = require('./src/manager/packetdetailRoutes');
app.use('/src/manager/packetdetail', packetdetailRoutes);
// ------------------------------------------------------------------------------------------------------
const appointmentRoutes = require('./src/appoint/appointmentRoutes');
app.use('/src/appoint', appointmentRoutes);

const preorderRoutes = require('./src/preorder/preorder');
app.use('/src/preorder/preorder', preorderRoutes);

const importRoute = require('./src/im/import');
app.use('/src/im', importRoute);
app.use("/src/in" , inspection);
app.use("/src/manager", patientRoutes);  
app.use("/src/manager", medicinesRoutes);  
app.use("/src/manager", categoryRoutes);  
app.use("/src/manager", serviceRoutes);  
app.use("/src/manager", diseaseRoutes);  
app.use("/src/manager", supplierRoutes);  

app.use("/src/manager", exchangeRoutes); 
app.use("/src/manager", EmpRoutes);  



const color = {
  
    yellow: "\x1b[33m",
    green: "\x1b[32m",
};


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});

// const express = require("express");
// const mysql = require('mysql');
// const app = express();
// const cors = require("cors");
// app.use(express.json());
// app.use(cors());
// const db =mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"dbcpsc_admin",
//     port:3306
// })
// const corsOptions = {
//     origin: 'http://localhost:8189', // แหล่งที่มาที่อนุญาตให้เข้าถึงเซิร์ฟเวอร์
//     credentials: true // เปิดใช้งาน credentials
//   };
  
// db.connect((err)=>{
//     if(err){
//         console.log('❌ Can not Connect mysql ❌')
//         return
//     }
//     console.log('CCCCCCCCConnect mysql Successful ✅✅✅')
// })
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


// // เพิ่มข้อมูลคนเจ็บ
// app.post("/manager/patient", (req, res) => {
//     const { patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district } = req.body;

//     const query = `
//         INSERT INTO tbPatient (patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(query, [patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນໄດ້ ❌", details: err });
//         }
//         res.status(201).json({ message: "ເພີ່ມຂໍ້ມູນສຳເລັດ ✅", patient_id: result.insertId });
//     });
// });


// // ดึงข้อมูลทั้งหมดของคนเจ็บ
// app.get("/manager/patient", (req, res) => {
//     const query = "SELECT * FROM tbPatient";
//     db.query(query, (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນ ❌", details: err });
//         }
//         res.status(200).json({ message: "ສະແດງຂໍ້ມູນຄົນເຈັບໄດ້ສຳເລັດແລ້ວ ✅", data: results });
//     });
// });



// // ดึงข้อมูลคนเจ็บที่มี id เฉพาะ
// app.get("/manager/patient/:id", (req, res) => {
//     const { id } = req.params;  // รับค่า id จาก URL parameters

//     const query = "SELECT * FROM tbPatient WHERE patient_id = ?"; // เลือกข้อมูลที่มี id ตรงกับที่ร้องขอ

//     db.query(query, [id], (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນ ❌", details: err });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ message: "ບໍ່ພົບ id ນີ້" });
//         }
//         res.status(200).json({ message: "ສະແດງຂໍ້ມູນຄົນເຈັບໄດ້ສຳເລັດແລ້ວ ✅", data: results[0] });  // ส่งผลลัพธ์ที่ตรงกับ id
//     });
// });

// // แก้ไขข้อมูลคนเจ็บ
// app.put("/manager/patient/:id", (req, res) => {
//     const { id } = req.params;
//     const { patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district } = req.body;

//     const query = `
//         UPDATE tbPatient
//         SET patient_name = ?, patient_surname = ?, gender = ?, dob = ?, phone1 = ?, phone2 = ?, village = ?, province = ?, district = ?
//         WHERE patient_id = ?
//     `;

//     db.query(query, [patient_name, patient_surname, gender, dob, phone1, phone2, village, province, district, id], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນ ❌", details: err });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "ບໍ່ພົບການແກ້ໄຂຂໍ້ມູນຂອງຄົນເຈັບນິ້" });
//         }
//         res.status(200).json({ message: "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ ✅" });
//     });
// });

// app.delete("/manager/patient/:id", (req, res) => {
//     console.log('Delete request received for patient ID:', req.params.id);  // Debugging log
//     const { id } = req.params;
//     const query = "DELETE FROM tbPatient WHERE patient_id = ?";

//     db.query(query, [id], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດລົບຂໍ້ມູນຄົນເຈັບໄດ້ ❌", details: err });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນຄົນເຈັບທີ່ຕ້ອງການລົບ" });
//         }
//         res.status(200).json({ message: "ລົບຂໍ້ມູນສຳເລັດແລ້ວ ✅" });
//     });
// });

// // ดึงข้อมูลคนเจ็บตามการค้นหา (ค้นหาตามชื่อ, นามสกุล, หมู่บ้าน, จังหวัด, อำเภอ)
// app.get("/manager/search/patient", (req, res) => {
//     const { patient_name, patient_surname, village, province, district } = req.query;

//     // สร้าง query ที่จะค้นหาตามพารามิเตอร์ที่ให้มา
//     let query = "SELECT * FROM tbPatient WHERE 1=1";  // เริ่มต้นด้วย 1=1 เพื่อให้สามารถเพิ่มเงื่อนไขการค้นหาได้

//     // ตรวจสอบว่ามีค่าของตัวแปรไหนบ้าง แล้วเพิ่มเงื่อนไขในการค้นหา
//     if (patient_name) {
//         query += ` AND patient_name LIKE '%${patient_name}%'`;
//     }
//     if (patient_surname) {
//         query += ` AND patient_surname LIKE '%${patient_surname}%'`;
//     }
//     if (village) {
//         query += ` AND village LIKE '%${village}%'`;
//     }
//     if (province) {
//         query += ` AND province LIKE '%${province}%'`;
//     }
//     if (district) {
//         query += ` AND district LIKE '%${district}%'`;
//     }

//     // ส่ง query ไปยังฐานข้อมูล
//     db.query(query, (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: "ບໍ່ສາມາດສະແດງຂໍ້ມູນ ❌", details: err });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ message: "ບໍ່ພົບຜົນການຄົ້ນຫາ" });
//         }
//         res.status(200).json({ message: "ສະແດງຂໍ້ມູນຄົນເຈັບໄດ້ສຳເລັດແລ້ວ ✅", data: results });
//     });
// });
