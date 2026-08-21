const express = require("express");

const authenticate = require("../../shared/middlewares/auth.middleware");
const validate = require("../../shared/middlewares/validate.middleware");
const { eventListSchema, eventIdSchema } = require("./event.validation");
const { getEvents, getEventDetails } = require("./event.controller");

const router = express.Router();

router.get("/", authenticate, validate(eventListSchema, "query"), getEvents);
router.get("/:eventId", authenticate, validate(eventIdSchema, "params"), getEventDetails);

module.exports = router;
