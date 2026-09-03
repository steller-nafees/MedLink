const repository = require("./hospital-admin.repository");

const noAssignment = (message = "No hospital assignment found for this admin") => {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
};

const getMyHospital = async (userId) => {
    const hospital = await repository.getHospitalByAdminId(userId);
    if (!hospital) throw noAssignment("No hospital assignment found");
    return hospital;
};

const getMyAssignments = async (userId) => repository.getAssignmentsByAdminId(userId);

const getDashboard = async (userId) => {
    const dashboard = await repository.getDashboardByAdminId(userId);
    if (!dashboard) throw noAssignment("No hospital assignment found");
    return dashboard;
};

const getAssignedHospital = async (userId) => {
    const hospital = await repository.getHospitalByAdminId(userId);
    if (!hospital) throw noAssignment();
    return hospital;
};

const getActiveCases = async (userId) => {
    const hospital = await repository.getHospitalIdByAdminId(userId);
    if (!hospital) throw noAssignment("No hospital assignment found");
    return repository.getActiveCasesByHospitalId(hospital.hospital_id);
};

const approveEmergencyCase = async (userId, eventId) => {
    const hospital = await repository.getHospitalIdByAdminId(userId);
    if (!hospital) throw noAssignment("No hospital assignment found");
    const event = await repository.approveEmergencyCase(eventId, hospital.hospital_id);
    if (!event) {
        const error = new Error("Emergency case not found or is no longer pending");
        error.statusCode = 404;
        throw error;
    }
    return event;
};

const assignBedToEvent = async (userId, eventId, bedNumber) => {
    const hospital = await getAssignedHospital(userId);
    const reservation = await repository.assignBedToEvent(eventId, hospital.hospital_id, bedNumber);
    if (!reservation) { const error = new Error("Reservation not found for this emergency case"); error.statusCode = 404; throw error; }
    return reservation;
};

const completeEmergencyCase = async (userId, eventId) => {
    const hospital = await getAssignedHospital(userId);
    const event = await repository.completeEmergencyCase(eventId, hospital.hospital_id);
    if (!event) { const error = new Error("Emergency case not found or already completed"); error.statusCode = 404; throw error; }
    return event;
};

const getDashboardAnalytics = async (userId) => {
    const hospital = await repository.getHospitalIdByAdminId(userId);
    if (!hospital) throw noAssignment("No hospital assignment found");
    return repository.getDashboardAnalyticsByHospitalId(hospital.hospital_id);
};

const getHospitalReservations = async (userId) => {
    const hospital = await getAssignedHospital(userId);
    return repository.getReservationsByHospital(hospital.hospital_id);
};

const getHospitalReservationById = async (userId, reservationId) => {
    const hospital = await getAssignedHospital(userId);
    const reservation = await repository.getReservationById(reservationId, hospital.hospital_id);
    if (!reservation) { const error = new Error("Reservation not found"); error.statusCode = 404; throw error; }
    return reservation;
};

const approveHospitalReservation = async (userId, reservationId) => {
    const hospital = await getAssignedHospital(userId);
    return repository.approveReservation(reservationId, hospital.hospital_id);
};

const getHospitalBeds = async (userId) => {
    const hospital = await getAssignedHospital(userId);
    return repository.getBedsByHospital(hospital.hospital_id);
};

const updateHospitalBedStatus = async (userId, bedId, bedStatus) => {
    const hospital = await getAssignedHospital(userId);
    const bed = await repository.updateBedStatus(bedId, hospital.hospital_id, bedStatus);
    if (!bed) { const error = new Error("Bed not found in your hospital"); error.statusCode = 404; throw error; }
    return bed;
};

const getHospitalPayments = async (userId) => {
    const hospital = await getAssignedHospital(userId);
    return repository.getPaymentsByHospitalId(hospital.hospital_id);
};

const getHospitalPaymentById = async (userId, paymentId) => {
    const hospital = await getAssignedHospital(userId);
    const payment = await repository.getPaymentById(paymentId, hospital.hospital_id);
    if (!payment) { const error = new Error("Payment not found"); error.statusCode = 404; throw error; }
    return payment;
};

const createHospitalPayment = async (userId, { reservationId, totalAmount, paymentMethod, paymentStatus = "UNPAID" }) => {
    const hospital = await getAssignedHospital(userId);
    const reservation = await repository.getReservationById(reservationId, hospital.hospital_id);
    if (!reservation) { const error = new Error("Reservation not found for this hospital"); error.statusCode = 404; throw error; }
    try {
        return await repository.createPayment({ reservationId, totalAmount, paymentMethod, paymentStatus, paidAt: paymentStatus === "PAID" ? new Date() : null });
    } catch (error) {
        if (error.code === "23505") { const duplicateError = new Error("A payment already exists for this reservation"); duplicateError.statusCode = 409; throw duplicateError; }
        throw error;
    }
};

const getPatientPayments = async (userId, patientId) => {
    const hospital = await getAssignedHospital(userId);
    return repository.getPaymentsByPatientId(patientId, hospital.hospital_id);
};

const updateHospitalPayment = async (userId, paymentId, { totalAmount, paymentMethod, paymentStatus }) => {
    const hospital = await getAssignedHospital(userId);
    const existingPayment = await repository.getPaymentById(paymentId, hospital.hospital_id);
    if (!existingPayment) { const error = new Error("Payment not found"); error.statusCode = 404; throw error; }
    let paidAt = existingPayment.paid_at;
    if (paymentStatus === "PAID" && !existingPayment.paid_at) paidAt = new Date();
    if (paymentStatus && paymentStatus !== "PAID") paidAt = null;
    return repository.updatePayment(paymentId, hospital.hospital_id, { totalAmount, paymentMethod, paymentStatus, paidAt });
};

module.exports = { getMyHospital, getMyAssignments, getDashboard, getActiveCases, approveEmergencyCase, assignBedToEvent, completeEmergencyCase, getDashboardAnalytics, getHospitalReservations, getHospitalReservationById, approveHospitalReservation, getHospitalBeds, updateHospitalBedStatus, getHospitalPayments, getHospitalPaymentById, createHospitalPayment, getPatientPayments, updateHospitalPayment };
