const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const {
    createReservation,
    getReservations,
    getReservationDetails,
    updateReservation,
    cancelReservation,
} = require("../controllers/reservation.controller");

const {
    createReservationSchema,
    updateReservationSchema,
    reservationIdSchema,
} = require("../validations/reservation.validation");

// ============================================================
// CREATE RESERVATION
// POST /api/v1/reservations
// ============================================================

router.post(
    "/",
    authenticate,
    validate(createReservationSchema),
    createReservation
);

// ============================================================
// GET ALL RESERVATIONS
// GET /api/v1/reservations
// ============================================================

router.get(
    "/",
    authenticate,
    getReservations
);

// ============================================================
// GET RESERVATION DETAILS
// GET /api/v1/reservations/:reservationId
// ============================================================

router.get(
    "/:reservationId",
    authenticate,
    validate(reservationIdSchema, "params"),
    getReservationDetails
);

// ============================================================
// UPDATE RESERVATION
// PUT /api/v1/reservations/:reservationId
// ============================================================

router.put(
    "/:reservationId",
    authenticate,
    validate(reservationIdSchema, "params"),
    validate(updateReservationSchema, "body"),
    updateReservation
);

// ============================================================
// CANCEL RESERVATION
// PUT /api/v1/reservations/:reservationId/cancel
// ============================================================

router.put(
    "/:reservationId/cancel",
    authenticate,
    validate(reservationIdSchema, "params"),
    cancelReservation
);

module.exports = router;