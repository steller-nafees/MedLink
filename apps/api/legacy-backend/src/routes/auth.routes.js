const express = require("express");

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { signupSchema, loginSchema, emergencyLoginSchema } = require("../validations/auth.validation");

const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/signup",
  validate(signupSchema),
  authController.signup
);

router.post(
    "/login",
    validate(loginSchema),
    authController.login
);

router.post(
    "/emergency-login",
    validate(emergencyLoginSchema),
    authController.startEmergencySession
);


router.post(
    "/logout",
    authenticate,
    authController.logout
);

module.exports = router;