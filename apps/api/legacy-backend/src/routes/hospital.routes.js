const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/authorize.middleware");

const validate = require("../middlewares/validate.middleware");

const {
    hospitalListSchema,
    nearbyHospitalSchema,
    hospitalIdSchema,
} = require("../validations/hospital.validation");

const {
    getHospitals,
    getNearbyHospitals,
    getHospitalDetails,
} = require("../controllers/hospital.controller");


// ============================================================
// GET /api/v1/hospitals
// ============================================================

router.get(
    "/",
    authenticate,
    authorize("CUSTOMER"),
    validate(hospitalListSchema, "query"),
    getHospitals
);


// ============================================================
// GET /api/v1/hospitals/nearby
// ============================================================

router.get(
    "/nearby",
    authenticate,
    authorize("CUSTOMER"),
    validate(nearbyHospitalSchema, "query"),
    getNearbyHospitals
);


// ============================================================
// GET /api/v1/hospitals/:hospitalId
// ============================================================

router.get(
    "/:hospitalId",
    authenticate,
    authorize("CUSTOMER"),
    validate(hospitalIdSchema, "params"),
    getHospitalDetails
);


module.exports = router;
