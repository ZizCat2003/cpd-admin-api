const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
app.use(express.json());
app.use(cors());

const patientRoutes = require("./src/manager/patientRoutes");
const medicinesRoutes = require("./src/manager/medicinesRoutes");
const categoryRoutes = require("./src/manager/categoryRoutes");
const serviceRoutes = require("./src/manager/serviceRoutes");
const exchangeRoutes = require("./src/manager/exchangeRoutes");
const diseaseRoutes = require("./src/manager/diseaseRoutes");
const supplierRoutes = require("./src/manager/supplierRoutes");
const EmpRoutes = require("./src/manager/EmpRoutes");
const inspection = require("./src/in/inspectionRoutes");
const authen = require("./src/auth/api_authen");
const stockRoutes = require("./src/stock/stock");
const invoiceRoutes = require("./src/invoice/invoice");
const paymentRoutes = require("./src/payment/payment");
const reportRoutes = require("./src/report/report");
const upoloadRoutes = require("./src/upload/uploadRoute");
const packetRoutes = require('./src/manager/packetRoutes');
const preorderRoute = require('./src/preorder/preorderRoutes');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/src/manager/packet', packetRoutes);
const packetdetailRoutes = require('./src/manager/packetdetailRoutes');
app.use('/src/manager/packetdetail', packetdetailRoutes);
// ------------------------------------------------------------------------------------------------------
const appointmentRoutes = require('./src/appoint/appointmentRoutes');
app.use('/src/appoint', appointmentRoutes);

const preorderRoutes = require('./src/preorder/preorderRoutes');
app.use('/src/preorder', preorderRoutes);
const preorder_detailRoutes = require('./src/preorder/preorder_detailRoutes');
app.use('/src/preorder_detail', preorder_detailRoutes);

const importRoute = require('./src/im/import');
app.use('/src/import/', importRoute);
app.use("/src/in", inspection);
app.use("/src/manager", patientRoutes);
app.use("/src/manager", medicinesRoutes);


app.use("/src/manager", categoryRoutes);
app.use("/src/manager", serviceRoutes);
app.use("/src/manager", diseaseRoutes);
app.use("/src/manager", supplierRoutes);

app.use("/src/manager", exchangeRoutes);
app.use("/src/manager", EmpRoutes);

app.use("/src/auth/authen/", authen);

app.use("/src/stock", stockRoutes);
app.use("/src/invoice", invoiceRoutes);
app.use("/src/payment", paymentRoutes);

app.use("/src/preorder", preorderRoute);

app.use("/src/report", reportRoutes);

app.use("/src/upload", upoloadRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
