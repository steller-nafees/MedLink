const express = require("express");

const router = express.Router();

const authenticate = require("../../shared/middlewares/auth.middleware");
const authorize = require("../../shared/middlewares/authorize.middleware");
const validate = require("../../shared/middlewares/validate.middleware");

const {
    profileSchema,
    updateProfileSchema,
    roleSchema,
    locationSchema,
} = require("./user.validation");

const {
    completeProfile,
    getProfile,
    updateProfile,
    getUserDetails,
    getAllUsers,
    updateRole,
    deleteUserAccount,
    getMyLocation,
    updateMyLocation,
    getUserById,
} = require("./user.controller");

router.post(
    "/profile",
    authenticate,
    validate(profileSchema),
    completeProfile
);

router.get(
    "/profile",
    authenticate,
    getProfile
);

router.put(
    "/profile",
    authenticate,
    validate(updateProfileSchema),
    updateProfile
);

router.get(
    "/all",
    authenticate,
    authorize("SUPER_ADMIN"),
    getAllUsers
);

router.get(
    "/location",
    authenticate,
    authorize(
        "CUSTOMER",
        "HOSPITAL_ADMIN",
        "AMBULANCE_ADMIN",
        "SUPER_ADMIN"
    ),
    getMyLocation
);

router.get(
    "/:userId",
    authenticate,
    authorize("SUPER_ADMIN"),
    getUserDetails
);

router.put(
    "/:userId/role",
    authenticate,
    authorize("SUPER_ADMIN"),
    validate(roleSchema),
    updateRole
);

router.delete(
    "/:userId",
    authenticate,
    authorize("CUSTOMER", "SUPER_ADMIN"),
    deleteUserAccount
);

router.put(
    "/location",
    authenticate,
    authorize(
        "CUSTOMER",
        "HOSPITAL_ADMIN",
        "AMBULANCE_ADMIN",
        "SUPER_ADMIN"
    ),
    validate(locationSchema),
    updateMyLocation
);

// Route from main
router.get("/:id", getUserById);

module.exports = router;