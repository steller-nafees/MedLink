const pool = require("../config/db");

// ============================================================
// GET ALL MEDICAL EVENTS
// ============================================================

const getAllEvents = async ({
    limit,
    offset,
    userId,
    isAdmin,
}) => {

    const values = [
        limit,
        offset,
    ];

    let userCondition = "";

    // CUSTOMER can only see their own events.
    // Admin-type users can see all events.

    if (!isAdmin) {

        values.push(userId);

        userCondition = `
            AND me.user_id = $3
        `;
    }

    const query = `

        SELECT

            me.id,
            me.user_id,
            me.user_description,
            me.event_location_latitude::double precision
                AS event_location_latitude,
            me.event_location_longitude::double precision
                AS event_location_longitude,
            me.severity,
            me.event_status,
            me.is_emergency,
            me.created_at,
            me.updated_at,

            up.first_name,
            up.last_name,
            u.phone

        FROM medical_events me

        INNER JOIN users u
            ON u.id = me.user_id

        LEFT JOIN user_profiles up
            ON up.user_id = me.user_id

        WHERE 1 = 1

        ${userCondition}

        ORDER BY me.created_at DESC

        LIMIT $1
        OFFSET $2;

    `;

    const result = await pool.query(
        query,
        values
    );

    return result.rows;
};


// ============================================================
// GET MEDICAL EVENT BY ID
// ============================================================

const getEventById = async ({
    eventId,
    userId,
    isAdmin,
}) => {

    const values = [
        eventId,
    ];

    let userCondition = "";

    // CUSTOMER can only access their own event.

    if (!isAdmin) {

        values.push(userId);

        userCondition = `
            AND me.user_id = $2
        `;
    }

    // --------------------------------------------------------
    // Get medical event
    // --------------------------------------------------------

    const eventQuery = `

        SELECT

            me.id,
            me.user_id,
            me.user_description,
            me.event_location_latitude::double precision
                AS event_location_latitude,
            me.event_location_longitude::double precision
                AS event_location_longitude,
            me.severity,
            me.event_status,
            me.is_emergency,
            me.created_at,
            me.updated_at,

            u.phone,

            up.first_name,
            up.last_name

        FROM medical_events me

        INNER JOIN users u
            ON u.id = me.user_id

        LEFT JOIN user_profiles up
            ON up.user_id = me.user_id

        WHERE me.id = $1

        ${userCondition};

    `;

    const eventResult = await pool.query(
        eventQuery,
        values
    );

    if (eventResult.rows.length === 0) {

        return null;
    }

    const event = eventResult.rows[0];


    // --------------------------------------------------------
    // Get linked hospitals
    // --------------------------------------------------------

    const hospitalsQuery = `

        SELECT

            eh.id,
            eh.hospital_id,
            h.hospital_name,
            h.phone,
            h.address,
            h.hospital_status,
            eh.created_at

        FROM event_hospitals eh

        INNER JOIN hospitals h
            ON h.id = eh.hospital_id

        WHERE eh.medical_event_id = $1

        ORDER BY eh.created_at ASC;

    `;

    const hospitalsResult = await pool.query(
        hospitalsQuery,
        [eventId]
    );


    // --------------------------------------------------------
    // Get linked ambulance providers
    // --------------------------------------------------------

    const ambulancesQuery = `

        SELECT

            ea.id,
            ea.ambulance_provider_id,
            ap.provider_name,
            ap.phone,
            ap.address,
            ap.latitude::double precision AS latitude,
            ap.longitude::double precision AS longitude,
            ap.is_active,
            ea.created_at

        FROM event_ambulances ea

        INNER JOIN ambulance_providers ap
            ON ap.id = ea.ambulance_provider_id

        WHERE ea.medical_event_id = $1

        ORDER BY ea.created_at ASC;

    `;

    const ambulancesResult = await pool.query(
        ambulancesQuery,
        [eventId]
    );


    return {

        ...event,

        hospitals: hospitalsResult.rows,

        ambulances: ambulancesResult.rows,

    };
};


module.exports = {
    getAllEvents,
    getEventById,
};