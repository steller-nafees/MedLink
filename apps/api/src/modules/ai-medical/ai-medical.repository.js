const pool = require("../../infrastructure/database/postgres");

const createMedicalEvent = async ({
    userId,
    userDescription,
    latitude,
    longitude,
    severity,
    isEmergency,
}) => {
    const result = await pool.query(`
        INSERT INTO medical_events (
            user_id,
            user_description,
            event_location_latitude,
            event_location_longitude,
            severity,
            event_status,
            is_emergency
        )
        VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
        RETURNING
            id,
            user_id,
            user_description,
            event_location_latitude,
            event_location_longitude,
            severity,
            event_status,
            is_emergency,
            created_at,
            updated_at;
    `, [
        userId,
        userDescription,
        latitude,
        longitude,
        severity,
        isEmergency,
    ]);

    return result.rows[0];
};

const createAIResponse = async ({
    medicalEventId,
    summary,
    possibleConditions,
    tags,
    firstAid,
}) => {
    const result = await pool.query(`
        INSERT INTO ai_responses (
            medical_event_id,
            summary,
            possible_conditions,
            tags,
            first_aid
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            medical_event_id,
            summary,
            possible_conditions,
            tags,
            first_aid,
            created_at;
    `, [
        medicalEventId,
        summary,
        possibleConditions,
        tags,
        firstAid,
    ]);

    return result.rows[0];
};

const getAIResponseByEventId = async (medicalEventId) => {
    const result = await pool.query(`
        SELECT
            id,
            medical_event_id,
            summary,
            possible_conditions,
            tags,
            first_aid,
            created_at
        FROM ai_responses
        WHERE medical_event_id = $1;
    `, [medicalEventId]);

    return result.rows[0] || null;
};

module.exports = {
    createMedicalEvent,
    createAIResponse,
    getAIResponseByEventId,
};
