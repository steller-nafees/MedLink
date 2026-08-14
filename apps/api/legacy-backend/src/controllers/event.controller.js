const eventService = require("../services/event.service");


// ============================================================
// GET ALL EVENTS
// ============================================================

const getEvents = async (req, res) => {

    try {

        const events = await eventService.getEvents({

            limit: req.query.limit,

            offset: req.query.offset,

            user: req.user,

        });

        return res.status(200).json({

            success: true,

            message: "Medical events fetched successfully",

            statusCode: 200,

            count: events.length,

            data: events,

        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message: error.message,

            statusCode:
                error.statusCode || 500,

        });

    }
};


// ============================================================
// GET EVENT DETAILS
// ============================================================

const getEventDetails = async (req, res) => {

    try {

        const event =
            await eventService.getEventDetails({

                eventId: req.params.eventId,

                user: req.user,

            });

        return res.status(200).json({

            success: true,

            message: "Medical event details fetched successfully",

            statusCode: 200,

            data: event,

        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message: error.message,

            statusCode:
                error.statusCode || 500,

        });

    }
};


module.exports = {
    getEvents,
    getEventDetails,
};