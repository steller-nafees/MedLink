const pool = require("../../infrastructure/database/postgres");

const withTransaction = async (callback) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const findMedicalEventForUpdate = async (client, medicalEventId) => {
    const result = await client.query(`
        SELECT id, user_id, event_status, is_emergency
        FROM medical_events
        WHERE id = $1
        FOR UPDATE;
    `, [medicalEventId]);

    return result.rows[0] || null;
};

const findHospital = async (client, hospitalId) => {
    const result = await client.query(`
        SELECT id, hospital_status
        FROM hospitals
        WHERE id = $1;
    `, [hospitalId]);

    return result.rows[0] || null;
};

const findWard = async (client, wardId, hospitalId) => {
    const result = await client.query(`
        SELECT id
        FROM hospital_wards
        WHERE id = $1 AND hospital_id = $2;
    `, [wardId, hospitalId]);

    return result.rows[0] || null;
};

const findBedForUpdate = async (client, bedId) => {
    const result = await client.query(`
        SELECT id, hospital_id, ward_id, bed_status
        FROM hospital_beds
        WHERE id = $1
        FOR UPDATE;
    `, [bedId]);

    return result.rows[0] || null;
};

const findActiveReservation = async (client, medicalEventId, userId) => {
    const result = await client.query(`
        SELECT id
        FROM reservations
        WHERE medical_event_id = $1
          AND user_id = $2
          AND reservation_status IN ('PENDING', 'APPROVED')
        LIMIT 1;
    `, [medicalEventId, userId]);

    return result.rows[0] || null;
};

const insertReservation = async (client, {
    medicalEventId, userId, hospitalId, wardId, bedId, reservationMode,
}) => {
    const result = await client.query(`
        INSERT INTO reservations (
            medical_event_id, user_id, hospital_id, ward_id, bed_id, reservation_mode
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id, medical_event_id, user_id, hospital_id, ward_id, bed_id,
            reservation_mode, reservation_status, requested_at, approved_at,
            created_at, updated_at;
    `, [medicalEventId, userId, hospitalId, wardId, bedId || null, reservationMode]);

    return result.rows[0];
};

const reserveBed = async (client, bedId) => {
    await client.query(`
        UPDATE hospital_beds
        SET bed_status = 'RESERVED'
        WHERE id = $1;
    `, [bedId]);
};

const releaseReservedBed = async (client, bedId) => {
    await client.query(`
        UPDATE hospital_beds
        SET bed_status = 'AVAILABLE'
        WHERE id = $1 AND bed_status = 'RESERVED';
    `, [bedId]);
};

const getAllReservations = async (userId) => {
    const result = await pool.query(`
        SELECT
            r.id, r.medical_event_id, r.user_id,
            r.hospital_id, h.hospital_name,
            r.ward_id, w.ward_name,
            r.bed_id, b.bed_number,
            r.reservation_mode, r.reservation_status,
            r.requested_at, r.approved_at, r.created_at, r.updated_at
        FROM reservations r
        INNER JOIN hospitals h ON h.id = r.hospital_id
        INNER JOIN hospital_wards w ON w.id = r.ward_id
        LEFT JOIN hospital_beds b ON b.id = r.bed_id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC;
    `, [userId]);

    return result.rows;
};

const getReservationById = async (reservationId, userId) => {
    const result = await pool.query(`
        SELECT
            r.id, r.medical_event_id, r.user_id,
            r.hospital_id, h.hospital_name,
            r.ward_id, w.ward_name,
            r.bed_id, b.bed_number,
            r.reservation_mode, r.reservation_status,
            r.requested_at, r.approved_at, r.created_at, r.updated_at
        FROM reservations r
        INNER JOIN hospitals h ON h.id = r.hospital_id
        INNER JOIN hospital_wards w ON w.id = r.ward_id
        LEFT JOIN hospital_beds b ON b.id = r.bed_id
        WHERE r.id = $1 AND r.user_id = $2;
    `, [reservationId, userId]);

    return result.rows[0] || null;
};

const findReservationForUpdate = async (client, reservationId, userId) => {
    const result = await client.query(`
        SELECT *
        FROM reservations
        WHERE id = $1 AND user_id = $2
        FOR UPDATE;
    `, [reservationId, userId]);

    return result.rows[0] || null;
};

const updateReservation = async (client, {
    reservationId, userId, hospitalId, wardId, bedId,
}) => {
    const result = await client.query(`
        UPDATE reservations
        SET hospital_id = $1, ward_id = $2, bed_id = $3
        WHERE id = $4 AND user_id = $5
        RETURNING
            id, medical_event_id, user_id, hospital_id, ward_id, bed_id,
            reservation_mode, reservation_status, requested_at, approved_at,
            created_at, updated_at;
    `, [hospitalId, wardId, bedId || null, reservationId, userId]);

    return result.rows[0];
};

const findReservationForCancellation = async (client, reservationId, userId) => {
    const result = await client.query(`
        SELECT id, bed_id, reservation_status
        FROM reservations
        WHERE id = $1 AND user_id = $2
        FOR UPDATE;
    `, [reservationId, userId]);

    return result.rows[0] || null;
};

const cancelReservation = async (client, reservationId, userId) => {
    const result = await client.query(`
        UPDATE reservations
        SET reservation_status = 'CANCELLED'
        WHERE id = $1 AND user_id = $2
        RETURNING
            id, medical_event_id, user_id, hospital_id, ward_id, bed_id,
            reservation_mode, reservation_status, requested_at, approved_at,
            created_at, updated_at;
    `, [reservationId, userId]);

    return result.rows[0];
};

module.exports = {
    withTransaction,
    findMedicalEventForUpdate,
    findHospital,
    findWard,
    findBedForUpdate,
    findActiveReservation,
    insertReservation,
    reserveBed,
    releaseReservedBed,
    getAllReservations,
    getReservationById,
    findReservationForUpdate,
    updateReservation,
    findReservationForCancellation,
    cancelReservation,
};
