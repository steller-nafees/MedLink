const express = require("express");

const router = express.Router();


// ============================================================
// MIDDLEWARES
// ============================================================

const authenticate =
    require("../middlewares/auth.middleware");

const validate =
    require("../middlewares/validate.middleware");


// ============================================================
// VALIDATION
// ============================================================

const {
    eventListSchema,
    eventIdSchema,
} = require("../validations/event.validation");


// ============================================================
// CONTROLLERS
// ============================================================

const {
    getEvents,
    getEventDetails,
} = require("../controllers/event.controller");


// ============================================================
// GET ALL MEDICAL EVENTS
// ============================================================

router.get(

    "/",

    authenticate,

    validate(
        eventListSchema,
        "query"
    ),

    getEvents

);


// ============================================================
// GET MEDICAL EVENT DETAILS
// ============================================================

router.get(

    "/:eventId",

    authenticate,

    validate(
        eventIdSchema,
        "params"
    ),

    getEventDetails

);


module.exports = router;