const express = require("express");

const authenticate = require(
    "../../shared/middlewares/auth.middleware"
);

const authorize = require(
    "../../shared/middlewares/authorize.middleware"
);

const validate = require(
    "../../shared/middlewares/validate.middleware"
);

const {
    getAllUsers,
    updateUserRole,
    updateUserStatus,

    getAllHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital,

    getAllAmbulanceProviders,
    getAmbulanceProviderById,
    createAmbulanceProvider,
    updateAmbulanceProvider,
    deleteAmbulanceProvider,

    getAdminDashboard
} = require("./admin.controller");

const {
    updateUserRoleSchema,
    updateUserStatusSchema,
    createHospitalSchema,
    updateHospitalSchema
} = require("./admin.validation");

const router = express.Router();


// ============================================================
// SUPER ADMIN DASHBOARD
// ============================================================

// GET /api/v1/admin/dashboard
router.get(
    "/dashboard",
    authenticate,
    authorize("SUPER_ADMIN"),
    getAdminDashboard
);

// ============================================================
// USER MANAGEMENT
// ============================================================

// GET /api/v1/admin/users
router.get(
    "/users",
    authenticate,
    authorize("SUPER_ADMIN"),
    getAllUsers
);


// PUT /api/v1/admin/users/:userId/role
router.put(
    "/users/:userId/role",
    authenticate,
    authorize("SUPER_ADMIN"),
    validate(updateUserRoleSchema),
    updateUserRole
);


// PUT /api/v1/admin/users/:userId/status
router.put(
    "/users/:userId/status",
    authenticate,
    authorize("SUPER_ADMIN"),
    validate(updateUserStatusSchema),
    updateUserStatus
);

// ============================================================
// HOSPITAL MANAGEMENT
// ============================================================

// GET /api/v1/admin/hospitals
router.get(
    "/hospitals",
    authenticate,
    authorize("SUPER_ADMIN"),
    getAllHospitals
);


// GET /api/v1/admin/hospitals/:hospitalId
router.get(
    "/hospitals/:hospitalId",
    authenticate,
    authorize("SUPER_ADMIN"),
    getHospitalById
);


// POST /api/v1/admin/hospitals
router.post(
    "/hospitals",
    authenticate,
    authorize("SUPER_ADMIN"),
    validate(createHospitalSchema),
    createHospital
);


// PUT /api/v1/admin/hospitals/:hospitalId
router.put(
    "/hospitals/:hospitalId",
    authenticate,
    authorize("SUPER_ADMIN"),
    validate(updateHospitalSchema),
    updateHospital
);


// DELETE /api/v1/admin/hospitals/:hospitalId
router.delete(
    "/hospitals/:hospitalId",
    authenticate,
    authorize("SUPER_ADMIN"),
    deleteHospital
);

// ============================================================
// AMBULANCE PROVIDER MANAGEMENT
// ============================================================


// GET /api/v1/admin/ambulance-providers
router.get(
    "/ambulance-providers",
    authenticate,
    authorize("SUPER_ADMIN"),
    getAllAmbulanceProviders
);


// GET /api/v1/admin/ambulance-providers/:ambulanceProviderId
router.get(
    "/ambulance-providers/:ambulanceProviderId",
    authenticate,
    authorize("SUPER_ADMIN"),
    getAmbulanceProviderById
);


// POST /api/v1/admin/ambulance-providers
router.post(
    "/ambulance-providers",
    authenticate,
    authorize("SUPER_ADMIN"),
    createAmbulanceProvider
);


// PUT /api/v1/admin/ambulance-providers/:ambulanceProviderId
router.put(
    "/ambulance-providers/:ambulanceProviderId",
    authenticate,
    authorize("SUPER_ADMIN"),
    updateAmbulanceProvider
);


// DELETE /api/v1/admin/ambulance-providers/:ambulanceProviderId
router.delete(
    "/ambulance-providers/:ambulanceProviderId",
    authenticate,
    authorize("SUPER_ADMIN"),
    deleteAmbulanceProvider
);



module.exports = router;
