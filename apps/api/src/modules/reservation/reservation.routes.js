const express = require("express");

const authenticate = require("../../shared/middlewares/auth.middleware");
const validate = require("../../shared/middlewares/validate.middleware");
const {
    createReservationSchema,
    updateReservationSchema,
    reservationIdSchema,
} = require("./reservation.validation");
const {
    createReservation,
    getReservations,
    getReservationDetails,
    updateReservation,
    cancelReservation,
} = require("./reservation.controller");

const router = express.Router();

router.post("/", authenticate, validate(createReservationSchema), createReservation);
router.get("/", authenticate, getReservations);
router.get("/:reservationId", authenticate, validate(reservationIdSchema, "params"), getReservationDetails);
router.put(
    "/:reservationId",
    authenticate,
    validate(reservationIdSchema, "params"),
    validate(updateReservationSchema, "body"),
    updateReservation
);
router.put(
    "/:reservationId/cancel",
    authenticate,
    validate(reservationIdSchema, "params"),
    cancelReservation
);

module.exports = router;
