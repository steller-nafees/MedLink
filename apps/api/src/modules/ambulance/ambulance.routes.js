const express = require("express");

const validate = require("../../shared/middlewares/validate.middleware");
const {
    ambulanceListSchema,
    nearbyAmbulanceSchema,
    ambulanceIdSchema,
} = require("./ambulance.validation");
const {
    getAmbulances,
    getNearbyAmbulances,
    getAmbulanceDetails,
} = require("./ambulance.controller");

const router = express.Router();

router.get(
    "/",
    validate(ambulanceListSchema, "query"),
    getAmbulances
);

router.get(
    "/nearby",
    validate(nearbyAmbulanceSchema, "query"),
    getNearbyAmbulances
);

router.get(
    "/:ambulanceId",
    validate(ambulanceIdSchema, "params"),
    getAmbulanceDetails
);

module.exports = router;
