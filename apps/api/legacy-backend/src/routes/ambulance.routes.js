const express = require("express");

const router = express.Router();

const validate = require("../middlewares/validate.middleware");

const {
    ambulanceListSchema,
    nearbyAmbulanceSchema,
    ambulanceIdSchema,
} = require("../validations/ambulance.validation");

const {
    getAmbulances,
    getNearbyAmbulances,
    getAmbulanceDetails,
} = require("../controllers/ambulance.controller");


// ============================================================
// GET ALL AMBULANCE PROVIDERS
// ============================================================

router.get(
    "/",
    validate(ambulanceListSchema, "query"),
    getAmbulances
);


// ============================================================
// GET NEARBY AMBULANCE PROVIDERS
// ============================================================

router.get(
    "/nearby",
    validate(nearbyAmbulanceSchema, "query"),
    getNearbyAmbulances
);


// ============================================================
// GET AMBULANCE PROVIDER DETAILS
// ============================================================

router.get(
    "/:ambulanceId",
    validate(ambulanceIdSchema, "params"),
    getAmbulanceDetails
);


module.exports = router;