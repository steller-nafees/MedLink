const eventRepository = require("./event.repository");

const isAdminUser = (user) => (
    user.role === "SUPER_ADMIN" ||
    user.role === "HOSPITAL_ADMIN" ||
    user.role === "AMBULANCE_ADMIN"
);

const getEvents = async ({ limit, offset, user }) => eventRepository.getAllEvents({
    limit,
    offset,
    userId: user.userId,
    isAdmin: isAdminUser(user),
});

const getEventDetails = async ({ eventId, user }) => {
    const event = await eventRepository.getEventById({
        eventId,
        userId: user.userId,
        isAdmin: isAdminUser(user),
    });

    if (!event) {
        const error = new Error("Medical event not found");
        error.statusCode = 404;
        throw error;
    }

    return event;
};

module.exports = {
    getEvents,
    getEventDetails,
};
