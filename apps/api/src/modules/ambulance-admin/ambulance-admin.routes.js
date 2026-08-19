const express = require("express");

const authenticate = require("../../shared/middlewares/auth.middleware");
const authorize = require("../../shared/middlewares/authorize.middleware");
const validate = require("../../shared/middlewares/validate.middleware");
const {
    ambulanceIdSchema,
    updateAmbulanceSchema,
    updateAmbulanceContactSchema,
} = require("./ambulance-admin.validation");
const {
    getAmbulance,
    updateAmbulance,
    deleteAmbulance,
    updateAmbulanceContact,
} = require("./ambulance-admin.controller");

const router = express.Router();

router.put(
    "/:ambulanceId/contact",
    authenticate,
    authorize("AMBULANCE_ADMIN"),
    validate(ambulanceIdSchema, "params"),
    validate(updateAmbulanceContactSchema),
    updateAmbulanceContact
);

router.get(
    "/:ambulanceId",
    authenticate,
    authorize("AMBULANCE_ADMIN"),
    validate(ambulanceIdSchema, "params"),
    getAmbulance
);

router.put(
    "/:ambulanceId",
    authenticate,
    authorize("AMBULANCE_ADMIN"),
    validate(ambulanceIdSchema, "params"),
    validate(updateAmbulanceSchema),
    updateAmbulance
);

router.delete(
    "/:ambulanceId",
    authenticate,
    authorize("AMBULANCE_ADMIN"),
    validate(ambulanceIdSchema, "params"),
    deleteAmbulance
);

module.exports = router;
