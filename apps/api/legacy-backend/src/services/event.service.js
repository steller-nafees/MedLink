const {
    getAllEvents,
    getEventById,
} = require("../models/event.model");


// ============================================================
// GET ALL EVENTS
// ============================================================

const getEvents = async ({
    limit,
    offset,
    user,
}) => {

    const isAdmin =
        user.role === "SUPER_ADMIN" ||
        user.role === "HOSPITAL_ADMIN" ||
        user.role === "AMBULANCE_ADMIN";

    return await getAllEvents({

        limit,

        offset,

        userId: user.userId,

        isAdmin,

    });
};


// ============================================================
// GET EVENT DETAILS
// ============================================================

const getEventDetails = async ({
    eventId,
    user,
}) => {

    const isAdmin =
        user.role === "SUPER_ADMIN" ||
        user.role === "HOSPITAL_ADMIN" ||
        user.role === "AMBULANCE_ADMIN";

    const event = await getEventById({

        eventId,

        userId: user.userId,

        isAdmin,

    });

    if (!event) {

        const error = new Error(
            "Medical event not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return event;
};


module.exports = {
    getEvents,
    getEventDetails,
};