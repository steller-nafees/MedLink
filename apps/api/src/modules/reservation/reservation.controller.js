const reservationService = require("./reservation.service");

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message,
        statusCode,
    });
};

const createReservation = async (req, res) => {
    try {
        const reservation = await reservationService.createReservation({
            medicalEventId: req.body.medicalEventId,
            userId: req.user.userId,
            hospitalId: req.body.hospitalId,
            wardId: req.body.wardId,
            bedId: req.body.bedId,
            reservationMode: req.body.reservationMode,
        });

        return res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            statusCode: 201,
            data: reservation,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const getReservations = async (req, res) => {
    try {
        const reservations = await reservationService.getReservations(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Reservations fetched successfully",
            statusCode: 200,
            count: reservations.length,
            data: reservations,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const getReservationDetails = async (req, res) => {
    try {
        const reservation = await reservationService.getReservationDetails({
            reservationId: req.params.reservationId,
            userId: req.user.userId,
        });

        return res.status(200).json({
            success: true,
            message: "Reservation details fetched successfully",
            statusCode: 200,
            data: reservation,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateReservation = async (req, res) => {
    try {
        const reservation = await reservationService.updateReservation({
            reservationId: req.params.reservationId,
            userId: req.user.userId,
            hospitalId: req.body.hospitalId,
            wardId: req.body.wardId,
            bedId: req.body.bedId,
        });

        return res.status(200).json({
            success: true,
            message: "Reservation updated successfully",
            statusCode: 200,
            data: reservation,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const cancelReservation = async (req, res) => {
    try {
        const reservation = await reservationService.cancelReservation({
            reservationId: req.params.reservationId,
            userId: req.user.userId,
        });

        return res.status(200).json({
            success: true,
            message: "Reservation cancelled successfully",
            statusCode: 200,
            data: reservation,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

module.exports = {
    createReservation,
    getReservations,
    getReservationDetails,
    updateReservation,
    cancelReservation,
};
