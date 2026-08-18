const express = require("express");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const hospitalRoutes = require("./modules/hospital/hospital.routes");
const ambulanceRoutes = require("./modules/ambulance/ambulance.routes");

const app = express();

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
app.use("/api/v1/ambulances", ambulanceRoutes);

module.exports = app;
