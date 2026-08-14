const {
    createReservationService,
    getReservationsService,
    getReservationDetailsService,
    updateReservationService,
    cancelReservationService,
} = require("../services/reservation.service");

// ============================================================
// CREATE RESERVATION
// ============================================================

const createReservation = async (req, res, next) => {

    try {

        const reservation =
            await createReservationService({
                medicalEventId:
                    req.body.medicalEventId,

                userId:
                    req.user.userId,

                hospitalId:
                    req.body.hospitalId,

                wardId:
                    req.body.wardId,

                bedId:
                    req.body.bedId,

                reservationMode:
                    req.body.reservationMode,
            });

        return res.status(201).json({

            success: true,

            message:
                "Reservation created successfully",

            statusCode: 201,

            data: reservation,
        });

    } catch (error) {

        next(error);
    }
};

// ============================================================
// GET ALL RESERVATIONS
// ============================================================

const getReservations = async (req, res, next) => {

    try {

        const reservations =
            await getReservationsService(
                req.user.userId
            );

        return res.status(200).json({

            success: true,

            message:
                "Reservations fetched successfully",

            statusCode: 200,

            count: reservations.length,

            data: reservations,
        });

    } catch (error) {

        next(error);
    }
};

// ============================================================
// GET RESERVATION DETAILS
// ============================================================

const getReservationDetails = async (
    req,
    res,
    next
) => {

    try {

        const reservation =
            await getReservationDetailsService({
                reservationId:
                    req.params.reservationId,

                userId:
                    req.user.userId,
            });

        return res.status(200).json({

            success: true,

            message:
                "Reservation details fetched successfully",

            statusCode: 200,

            data: reservation,
        });

    } catch (error) {

        next(error);
    }
};

// ============================================================
// UPDATE RESERVATION
// ============================================================

const updateReservation = async (
    req,
    res,
    next
) => {

    try {

        const reservation =
            await updateReservationService({

                reservationId:
                    req.params.reservationId,

                userId:
                    req.user.userId,

                hospitalId:
                    req.body.hospitalId,

                wardId:
                    req.body.wardId,

                bedId:
                    req.body.bedId,
            });

        return res.status(200).json({

            success: true,

            message:
                "Reservation updated successfully",

            statusCode: 200,

            data: reservation,
        });

    } catch (error) {

        next(error);
    }
};

// ============================================================
// CANCEL RESERVATION
// ============================================================

const cancelReservation = async (
    req,
    res,
    next
) => {

    try {

        const reservation =
            await cancelReservationService({

                reservationId:
                    req.params.reservationId,

                userId:
                    req.user.userId,
            });

        return res.status(200).json({

            success: true,

            message:
                "Reservation cancelled successfully",

            statusCode: 200,

            data: reservation,
        });

    } catch (error) {

        next(error);
    }
};

module.exports = {
    createReservation,
    getReservations,
    getReservationDetails,
    updateReservation,
    cancelReservation,
};