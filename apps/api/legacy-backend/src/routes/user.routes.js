const express = require("express");

const router = express.Router();

const authenticate  = require("../middlewares/auth.middleware");

const validate = require("../middlewares/validate.middleware");

const { profileSchema, 
        updateProfileSchema,
        roleSchema,
        locationSchema
     } = require("../validations/user.validation");

const { completeProfile, 
        getProfile, 
        updateProfile, 
        getUserDetails, 
        getAllUsers, 
        updateRole,
        deleteUserAccount,
        getMyLocation,
        updateMyLocation
    } = require("../controllers/user.controller");

const authorize = require("../middlewares/authorize.middleware");


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

module.exports = router;