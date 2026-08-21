const express = require("express");

const authenticate = require("../../shared/middlewares/auth.middleware");
const validate = require("../../shared/middlewares/validate.middleware");
const { consult } = require("./ai-medical.controller");
const { aiMedicalConsultSchema } = require("./ai-medical.validation");

const router = express.Router();

router.post(
    "/consult",
    authenticate,
    validate(aiMedicalConsultSchema),
    consult
);

module.exports = router;
