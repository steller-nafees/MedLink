const express = require("express");

const {
  signup,
  login,
  startEmergencySession,
  logout,
} = require("./auth.controller");
const validate = require("../../shared/middlewares/validate.middleware");
const authenticate = require("../../shared/middlewares/auth.middleware");
const {
  signupSchema,
  loginSchema,
  emergencyLoginSchema,
} = require("./auth.validation");

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post(
  "/emergency-login",
  validate(emergencyLoginSchema),
  startEmergencySession
);
router.post("/logout", authenticate, logout);

module.exports = router;
