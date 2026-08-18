const express = require("express");

const authenticate = require("../../shared/middlewares/auth.middleware");
const authorize = require("../../shared/middlewares/authorize.middleware");
const validate = require("../../shared/middlewares/validate.middleware");
const {
    hospitalListSchema,
    nearbyHospitalSchema,
    hospitalIdSchema,
} = require("./hospital.validation");
const {
    getHospitals,
    getNearbyHospitals,
    getHospitalDetails,
} = require("./hospital.controller");

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorize("CUSTOMER"),
    validate(hospitalListSchema, "query"),
    getHospitals
);

router.get(
    "/nearby",
    authenticate,
    authorize("CUSTOMER"),
    validate(nearbyHospitalSchema, "query"),
    getNearbyHospitals
);

router.get(
    "/:hospitalId",
    authenticate,
    authorize("CUSTOMER"),
    validate(hospitalIdSchema, "params"),
    getHospitalDetails
);

module.exports = router;
