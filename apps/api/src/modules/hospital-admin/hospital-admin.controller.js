const service = require("./hospital-admin.service");

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message, statusCode });
};

const respond = (handler, message, statusCode = 200, count = false) => async (req, res) => {
    try {
        const data = await handler(req);
        return res.status(statusCode).json({ success: true, message, statusCode, ...(count ? { count: data.length } : {}), data });
    } catch (error) { return sendError(res, error); }
};

const getMyHospital = respond((req) => service.getMyHospital(req.user.userId), "Hospital information fetched successfully");
const getMyAssignments = respond((req) => service.getMyAssignments(req.user.userId), "Hospital assignments fetched successfully", 200, true);
const getDashboard = respond((req) => service.getDashboard(req.user.userId), "Hospital dashboard fetched successfully");
const getActiveCases = respond((req) => service.getActiveCases(req.user.userId), "Active cases fetched successfully");
const approveEmergencyCase = respond((req) => service.approveEmergencyCase(req.user.userId, req.params.eventId), "Emergency case approved successfully");
const assignBedToEvent = respond((req) => service.assignBedToEvent(req.user.userId, req.params.eventId, req.body.bedNumber), "Bed assigned successfully");
const completeEmergencyCase = respond((req) => service.completeEmergencyCase(req.user.userId, req.params.eventId), "Emergency case completed successfully");
const redirectEmergencyCase = respond((req) => service.redirectEmergencyCase(req.user.userId, req.params.eventId), "Emergency case redirected successfully");
const getDashboardAnalytics = respond((req) => service.getDashboardAnalytics(req.user.userId), "Hospital dashboard analytics fetched successfully");
const getReservations = respond((req) => service.getHospitalReservations(req.user.userId), "Hospital reservations fetched successfully", 200, true);
const getReservationById = respond((req) => service.getHospitalReservationById(req.user.userId, req.params.reservationId), "Reservation details fetched successfully");
const approveReservation = respond((req) => service.approveHospitalReservation(req.user.userId, req.params.reservationId), "Reservation approved successfully");
const getBeds = respond((req) => service.getHospitalBeds(req.user.userId), "Hospital beds fetched successfully", 200, true);
const updateBedStatus = respond((req) => service.updateHospitalBedStatus(req.user.userId, req.params.bedId, req.body.bedStatus), "Bed status updated successfully");
const getPayments = respond((req) => service.getHospitalPayments(req.user.userId), "Hospital payments fetched successfully", 200, true);
const getPaymentById = respond((req) => service.getHospitalPaymentById(req.user.userId, req.params.paymentId), "Payment details fetched successfully");
const createPayment = respond((req) => service.createHospitalPayment(req.user.userId, req.body), "Payment created successfully", 201);
const getPatientPayments = respond((req) => service.getPatientPayments(req.user.userId, req.params.patientId), "Patient payment records fetched successfully", 200, true);
const updatePayment = respond((req) => service.updateHospitalPayment(req.user.userId, req.params.paymentId, req.body), "Payment updated successfully");

module.exports = { getMyHospital, getMyAssignments, getDashboard, getActiveCases, approveEmergencyCase, assignBedToEvent, completeEmergencyCase, redirectEmergencyCase, getDashboardAnalytics, getReservations, getReservationById, approveReservation, getBeds, updateBedStatus, getPayments, getPaymentById, createPayment, getPatientPayments, updatePayment };
