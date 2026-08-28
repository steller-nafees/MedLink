const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const hospitalRoutes = require("./modules/hospital/hospital.routes");
const hospitalAdminRoutes = require("./modules/hospital-admin/hospital-admin.routes");
const ambulanceRoutes = require("./modules/ambulance/ambulance.routes");
const ambulanceAdminRoutes = require("./modules/ambulance-admin/ambulance-admin.routes");
const reservationRoutes = require("./modules/reservation/reservation.routes");
const eventRoutes = require("./modules/event/event.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const aiMedicalRoutes = require("./modules/ai-medical/ai-medical.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "MedLink API Running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/hospitals", hospitalRoutes);
app.use("/api/v1/hospital", hospitalAdminRoutes);
app.use("/api/v1/ambulances", ambulanceRoutes);
app.use("/api/v1/ambulances", ambulanceAdminRoutes);
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/ai-medical", aiMedicalRoutes);
app.use("/api/v1/admin", adminRoutes);

module.exports = app;
