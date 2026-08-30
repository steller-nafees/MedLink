const reservationRepository = require("./reservation.repository");

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const createReservation = async ({
    medicalEventId, userId, hospitalId, wardId, bedId, reservationMode,
}) => reservationRepository.withTransaction(async (client) => {
    const persistedReservationMode = reservationMode === "ICU"
        ? "EMERGENCY"
        : reservationMode;
    const event = await reservationRepository.findMedicalEventForUpdate(client, medicalEventId);

    if (!event) {
        throw createError("Medical event not found", 404);
    }

    if (event.user_id !== userId) {
        throw createError("You can only create a reservation for your own medical event", 403);
    }

    if (event.event_status === "COMPLETED" || event.event_status === "CANCELLED") {
        throw createError("Reservation cannot be created for a completed or cancelled medical event", 400);
    }

    const hospital = await reservationRepository.findHospital(client, hospitalId);

    if (!hospital) {
        throw createError("Hospital not found", 404);
    }

    if (hospital.hospital_status !== "OPEN") {
        throw createError("Hospital is not currently open", 400);
    }

    const ward = await reservationRepository.findWard(client, wardId, hospitalId);

    if (!ward) {
        throw createError("Ward does not belong to the selected hospital", 400);
    }

    if (bedId) {
        const bed = await reservationRepository.findBedForUpdate(client, bedId);

        if (!bed) {
            throw createError("Bed not found", 404);
        }

        if (bed.hospital_id !== hospitalId || bed.ward_id !== wardId) {
            throw createError("Bed does not belong to the selected hospital and ward", 400);
        }

        if (bed.bed_status !== "AVAILABLE") {
            throw createError("Selected bed is not available", 400);
        }
    }

    const activeReservation = await reservationRepository.findActiveReservation(
        client, medicalEventId, userId
    );

    if (activeReservation) {
        throw createError("An active reservation already exists for this medical event", 409);
    }

    const reservation = await reservationRepository.insertReservation(client, {
        medicalEventId,
        userId,
        hospitalId,
        wardId,
        bedId,
        reservationMode: persistedReservationMode,
    });

    await reservationRepository.linkEventToHospital(client, medicalEventId, hospitalId);

    if (bedId) {
        await reservationRepository.reserveBed(client, bedId);
    }

    return reservation;
});

const getReservations = async (userId) => {
    return reservationRepository.getAllReservations(userId);
};

const getReservationDetails = async ({ reservationId, userId }) => {
    const reservation = await reservationRepository.getReservationById(reservationId, userId);

    if (!reservation) {
        throw createError("Reservation not found", 404);
    }

    return reservation;
};

const updateReservation = async ({ reservationId, userId, hospitalId, wardId, bedId }) => {
    return reservationRepository.withTransaction(async (client) => {
        const reservation = await reservationRepository.findReservationForUpdate(
            client, reservationId, userId
        );

        if (!reservation) {
            throw createError("Reservation not found", 404);
        }

        if (reservation.reservation_status !== "PENDING") {
            throw createError("Only pending reservations can be updated", 400);
        }

        const newHospitalId = hospitalId || reservation.hospital_id;
        const newWardId = wardId || reservation.ward_id;
        const newBedId = bedId !== undefined ? bedId : reservation.bed_id;

        const hospital = await reservationRepository.findHospital(client, newHospitalId);

        if (!hospital) {
            throw createError("Hospital not found", 404);
        }

        if (hospital.hospital_status !== "OPEN") {
            throw createError("Hospital is not currently open", 400);
        }

        const ward = await reservationRepository.findWard(client, newWardId, newHospitalId);

        if (!ward) {
            throw createError("Ward does not belong to the selected hospital", 400);
        }

        if (reservation.bed_id && reservation.bed_id !== newBedId) {
            await reservationRepository.releaseReservedBed(client, reservation.bed_id);
        }

        if (newBedId) {
            const bed = await reservationRepository.findBedForUpdate(client, newBedId);

            if (!bed) {
                throw createError("Bed not found", 404);
            }

            if (bed.hospital_id !== newHospitalId || bed.ward_id !== newWardId) {
                throw createError("Bed does not belong to the selected hospital and ward", 400);
            }

            if (bed.bed_status !== "AVAILABLE" && bed.id !== reservation.bed_id) {
                throw createError("Selected bed is not available", 400);
            }

            await reservationRepository.reserveBed(client, newBedId);
        }

        return reservationRepository.updateReservation(client, {
            reservationId,
            userId,
            hospitalId: newHospitalId,
            wardId: newWardId,
            bedId: newBedId,
        });
    });
};

const cancelReservation = async ({ reservationId, userId }) => {
    return reservationRepository.withTransaction(async (client) => {
        const reservation = await reservationRepository.findReservationForCancellation(
            client, reservationId, userId
        );

        if (!reservation) {
            throw createError("Reservation not found", 404);
        }

        if (reservation.reservation_status === "CANCELLED") {
            throw createError("Reservation is already cancelled", 400);
        }

        if (reservation.reservation_status === "COMPLETED") {
            throw createError("Completed reservations cannot be cancelled", 400);
        }

        const cancelledReservation = await reservationRepository.cancelReservation(
            client, reservationId, userId
        );

        if (reservation.bed_id) {
            await reservationRepository.releaseReservedBed(client, reservation.bed_id);
        }

        return cancelledReservation;
    });
};

module.exports = {
    createReservation,
    getReservations,
    getReservationDetails,
    updateReservation,
    cancelReservation,
};
