const express = require("express");
const authenticate = require("../../shared/middlewares/auth.middleware");
const authorize = require("../../shared/middlewares/authorize.middleware");
const validate = require("../../shared/middlewares/validate.middleware");
const { assignBedSchema, updateBedStatusSchema } = require("./hospital-admin.validation");
const controller = require("./hospital-admin.controller");

const router = express.Router();
const adminOnly = [authenticate, authorize("HOSPITAL_ADMIN")];

router.get("/my-hospital", ...adminOnly, controller.getMyHospital);
router.get("/my-assignments", ...adminOnly, controller.getMyAssignments);
router.get("/dashboard", ...adminOnly, controller.getDashboard);
router.get("/dashboard/analytics", ...adminOnly, controller.getDashboardAnalytics);
router.get("/dashboard/active-cases", ...adminOnly, controller.getActiveCases);
router.put("/dashboard/active-cases/:eventId/approve", ...adminOnly, controller.approveEmergencyCase);
router.put("/dashboard/active-cases/:eventId/assign-bed", ...adminOnly, validate(assignBedSchema), controller.assignBedToEvent);
router.put("/dashboard/active-cases/:eventId/complete", ...adminOnly, controller.completeEmergencyCase);
router.get("/reservations", ...adminOnly, controller.getReservations);
router.get("/reservations/:reservationId", ...adminOnly, controller.getReservationById);
router.put("/reservations/:reservationId/approve", ...adminOnly, controller.approveReservation);
router.get("/beds", ...adminOnly, controller.getBeds);
router.put("/beds/:bedId/status", ...adminOnly, validate(updateBedStatusSchema), controller.updateBedStatus);
router.get("/payments", ...adminOnly, controller.getPayments);
router.get("/payments/:paymentId", ...adminOnly, controller.getPaymentById);
router.post("/payments", ...adminOnly, controller.createPayment);
router.get("/payments/patient/:patientId", ...adminOnly, controller.getPatientPayments);
router.put("/payments/:paymentId", ...adminOnly, controller.updatePayment);

module.exports = router;
