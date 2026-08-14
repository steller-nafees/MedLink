const express = require("express");

const authRoutes = require("./modules/auth/auth.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "MedLink API Running",
  });
});

app.use("/api/v1/auth", authRoutes);

module.exports = app;