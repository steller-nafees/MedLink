const {
    createReservation,
    getAllReservations,
    getReservationById,
    updateReservation,
    cancelReservation,
} = require("../models/reservation.model");

// ============================================================
// CREATE RESERVATION
// ============================================================

const createReservationService = async ({
    medicalEventId,
    userId,
    hospitalId,
    wardId,
    bedId,
    reservationMode,
}) => {

    return await createReservation({
        medicalEventId,
        userId,
        hospitalId,
        wardId,
        bedId,
        reservationMode,
    });
};

// ============================================================
// GET ALL RESERVATIONS
// ============================================================

const getReservationsService = async (userId) => {

    return await getAllReservations(userId);
};

// ============================================================
// GET RESERVATION DETAILS
// ============================================================

const getReservationDetailsService = async ({
    reservationId,
    userId,
}) => {

    const reservation = await getReservationById(
        reservationId,
        userId
    );

    if (!reservation) {

        const error = new Error(
            "Reservation not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return reservation;
};

// ============================================================
// UPDATE RESERVATION
// ============================================================

const updateReservationService = async ({
    reservationId,
    userId,
    hospitalId,
    wardId,
    bedId,
}) => {

    return await updateReservation({
        reservationId,
        userId,
        hospitalId,
        wardId,
        bedId,
    });
};

// ============================================================
// CANCEL RESERVATION
// ============================================================

const cancelReservationService = async ({
    reservationId,
    userId,
}) => {

    return await cancelReservation(
        reservationId,
        userId
    );
};

module.exports = {
    createReservationService,
    getReservationsService,
    getReservationDetailsService,
    updateReservationService,
    cancelReservationService,
};