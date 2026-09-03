const express = require("express");

const authenticate = require("../../shared/middlewares/auth.middleware");
const authorize = require("../../shared/middlewares/authorize.middleware");
const validate = require("../../shared/middlewares/validate.middleware");

const {
    donorListQuerySchema,
    donorIdParamSchema,
} = require("./blood.validation");

const {
    getBloodDonors,
    getBloodDonorById,
} = require("./blood.controller");

const router = express.Router();

router.get(
    "/donors",
    authenticate,
    authorize("CUSTOMER"),
    validate(donorListQuerySchema, "query"),
    getBloodDonors
);

router.get(
    "/donors/:donorId",
    authenticate,
    authorize("CUSTOMER"),
    validate(donorIdParamSchema, "params"),
    getBloodDonorById
);

module.exports = router;