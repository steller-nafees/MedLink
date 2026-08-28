const pool = require("../../infrastructure/database/postgres");

const getHospitalIdByAdminId = async (userId) => {
    const result = await pool.query(
        "SELECT hospital_id FROM hospital_admins WHERE user_id = $1;",
        [userId]
    );
    return result.rows[0] || null;
};

const getHospitalByAdminId = async (userId) => {
    const result = await pool.query(`
        SELECT h.id AS hospital_id, h.hospital_name AS name,
            h.latitude::double precision AS latitude,
            h.longitude::double precision AS longitude,
            COUNT(DISTINCT b.id)::integer AS total_beds,
            COUNT(DISTINCT b.id) FILTER (WHERE w.ward_name ILIKE '%ICU%')::integer AS total_icu_beds
        FROM hospital_admins ha
        INNER JOIN hospitals h ON h.id = ha.hospital_id
        LEFT JOIN hospital_beds b ON b.hospital_id = h.id
        LEFT JOIN hospital_wards w ON w.id = b.ward_id
        WHERE ha.user_id = $1
        GROUP BY h.id, h.hospital_name, h.latitude, h.longitude;
    `, [userId]);
    return result.rows[0] || null;
};

const getAssignmentsByAdminId = async (userId) => {
    const result = await pool.query(`
        SELECT ha.id AS assignment_id, h.id AS hospital_id,
            h.hospital_name AS hospital_name, h.license_number, h.email,
            h.phone, h.address, h.latitude::double precision AS latitude,
            h.longitude::double precision AS longitude, h.hospital_status,
            ha.joined_at
        FROM hospital_admins ha
        INNER JOIN hospitals h ON h.id = ha.hospital_id
        WHERE ha.user_id = $1
        ORDER BY ha.joined_at DESC;
    `, [userId]);
    return result.rows;
};

const getDashboardByAdminId = async (userId) => {
    const result = await pool.query(`
        SELECT h.id AS hospital_id, h.hospital_name AS hospital_name, h.hospital_status,
            COUNT(DISTINCT b.id)::integer AS total_beds,
            COUNT(DISTINCT b.id) FILTER (WHERE b.bed_status = 'AVAILABLE')::integer AS available_beds,
            COUNT(DISTINCT b.id) FILTER (WHERE b.bed_status = 'OCCUPIED')::integer AS occupied_beds,
            COUNT(DISTINCT b.id) FILTER (WHERE b.bed_status = 'MAINTENANCE')::integer AS maintenance_beds,
            COUNT(DISTINCT b.id) FILTER (WHERE w.ward_name ILIKE '%ICU%')::integer AS total_icu_beds,
            COUNT(DISTINCT r.id) FILTER (WHERE r.reservation_status = 'PENDING')::integer AS pending_reservations,
            COUNT(DISTINCT CASE WHEN me.event_status NOT IN ('COMPLETED', 'CANCELLED') THEN me.id END)::integer AS active_cases
        FROM hospital_admins ha
        INNER JOIN hospitals h ON h.id = ha.hospital_id
        LEFT JOIN hospital_beds b ON b.hospital_id = h.id
        LEFT JOIN hospital_wards w ON w.id = b.ward_id
        LEFT JOIN reservations r ON r.hospital_id = h.id
        LEFT JOIN event_hospitals eh ON eh.hospital_id = h.id
        LEFT JOIN medical_events me ON me.id = eh.medical_event_id
        WHERE ha.user_id = $1
        GROUP BY h.id, h.hospital_name, h.hospital_status;
    `, [userId]);
    return result.rows[0] || null;
};

const getActiveCasesByHospitalId = async (hospitalId) => {
    const result = await pool.query(`
        SELECT me.id AS event_id, me.user_id, me.user_description,
            me.event_location_latitude::double precision AS event_location_latitude,
            me.event_location_longitude::double precision AS event_location_longitude,
            me.severity, me.event_status, me.is_emergency, me.created_at, me.updated_at
        FROM event_hospitals eh
        INNER JOIN medical_events me ON me.id = eh.medical_event_id
        WHERE eh.hospital_id = $1 AND me.event_status NOT IN ('COMPLETED', 'CANCELLED')
        ORDER BY me.created_at DESC;
    `, [hospitalId]);
    return result.rows;
};

const getDashboardAnalyticsByHospitalId = async (hospitalId) => {
    const weeklyResult = await pool.query(`
        WITH days AS (
            SELECT generate_series(
                date_trunc('day', CURRENT_DATE)::date - INTERVAL '6 days',
                date_trunc('day', CURRENT_DATE)::date,
                INTERVAL '1 day'
            )::date AS day
        )
        SELECT to_char(days.day, 'Dy') AS day,
            COALESCE(COUNT(DISTINCT me.id), 0)::integer AS cases
        FROM days
        LEFT JOIN event_hospitals eh
            ON eh.hospital_id = $1
        LEFT JOIN medical_events me
            ON me.id = eh.medical_event_id
            AND me.created_at::date = days.day
        GROUP BY days.day
        ORDER BY days.day;
    `, [hospitalId]);

    const severityResult = await pool.query(`
        WITH severities(severity, sort_order) AS (
            VALUES ('critical', 1), ('high', 2), ('moderate', 3), ('low', 4)
        ),
        counts AS (
            SELECT LOWER(me.severity) AS severity, COUNT(DISTINCT me.id)::integer AS count
            FROM event_hospitals eh
            INNER JOIN medical_events me ON me.id = eh.medical_event_id
            WHERE eh.hospital_id = $1
                AND me.created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY LOWER(me.severity)
        ),
        total AS (
            SELECT COALESCE(SUM(count), 0)::integer AS count FROM counts
        )
        SELECT initcap(severities.severity) AS name,
            CASE WHEN total.count = 0 THEN 0
                ELSE ROUND((COALESCE(counts.count, 0)::numeric / total.count) * 100)::integer
            END AS value
        FROM severities
        CROSS JOIN total
        LEFT JOIN counts ON counts.severity = severities.severity
        ORDER BY severities.sort_order;
    `, [hospitalId]);

    return {
        weekly: weeklyResult.rows,
        bySeverity: severityResult.rows,
    };
};

const getReservationsByHospital = async (hospitalId) => {
    const result = await pool.query(`
        SELECT r.id AS reservation_id, r.medical_event_id, r.user_id, r.hospital_id,
            r.ward_id, r.bed_id, r.reservation_mode, r.reservation_status,
            r.requested_at, r.approved_at, r.created_at, r.updated_at,
            me.user_description, me.severity, me.event_status, me.is_emergency,
            me.event_location_latitude, me.event_location_longitude, hw.ward_name,
            hb.bed_number, hb.bed_status
        FROM reservations r
        INNER JOIN medical_events me ON r.medical_event_id = me.id
        INNER JOIN hospital_wards hw ON r.ward_id = hw.id
        LEFT JOIN hospital_beds hb ON r.bed_id = hb.id
        WHERE r.hospital_id = $1
        ORDER BY r.requested_at DESC;
    `, [hospitalId]);
    return result.rows;
};

const getReservationById = async (reservationId, hospitalId) => {
    const result = await pool.query(`
        SELECT r.id AS reservation_id, r.medical_event_id, r.user_id, r.hospital_id,
            r.ward_id, r.bed_id, r.reservation_mode, r.reservation_status,
            r.requested_at, r.approved_at, r.created_at, r.updated_at,
            me.user_description, me.severity, me.event_status, me.is_emergency,
            me.event_location_latitude, me.event_location_longitude, hw.ward_name,
            hw.description AS ward_description, hb.bed_number, hb.bed_status
        FROM reservations r
        INNER JOIN medical_events me ON r.medical_event_id = me.id
        INNER JOIN hospital_wards hw ON r.ward_id = hw.id
        LEFT JOIN hospital_beds hb ON r.bed_id = hb.id
        WHERE r.id = $1 AND r.hospital_id = $2
        LIMIT 1;
    `, [reservationId, hospitalId]);
    return result.rows[0] || null;
};

const approveReservation = async (reservationId, hospitalId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const reservationResult = await client.query(`
            SELECT id, hospital_id, ward_id, bed_id, reservation_status
            FROM reservations WHERE id = $1 AND hospital_id = $2 FOR UPDATE;
        `, [reservationId, hospitalId]);
        if (reservationResult.rows.length === 0) {
            const error = new Error("Reservation not found"); error.statusCode = 404; throw error;
        }
        const reservation = reservationResult.rows[0];
        if (reservation.reservation_status !== "PENDING") {
            const error = new Error("Only pending reservations can be approved"); error.statusCode = 400; throw error;
        }
        if (!reservation.bed_id) {
            const error = new Error("Reservation does not have a bed assigned"); error.statusCode = 400; throw error;
        }
        const bedResult = await client.query(`
            SELECT id, hospital_id, ward_id, bed_status FROM hospital_beds
            WHERE id = $1 AND hospital_id = $2 AND ward_id = $3 FOR UPDATE;
        `, [reservation.bed_id, hospitalId, reservation.ward_id]);
        if (bedResult.rows.length === 0) {
            const error = new Error("Assigned bed was not found"); error.statusCode = 404; throw error;
        }
        await client.query(`UPDATE hospital_beds SET bed_status = 'RESERVED', updated_at = CURRENT_TIMESTAMP WHERE id = $1;`, [reservation.bed_id]);
        const updatedReservationResult = await client.query(`
            UPDATE reservations SET reservation_status = 'APPROVED', approved_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP WHERE id = $1
            RETURNING id AS reservation_id, medical_event_id, user_id, hospital_id, ward_id,
                bed_id, reservation_mode, reservation_status, requested_at, approved_at,
                created_at, updated_at;
        `, [reservationId]);
        await client.query("COMMIT");
        return updatedReservationResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const getBedsByHospital = async (hospitalId) => {
    const result = await pool.query(`
        SELECT hb.id AS bed_id, hb.bed_number, hb.bed_status, hw.id AS ward_id,
            hw.ward_name, hb.created_at, hb.updated_at
        FROM hospital_beds hb JOIN hospital_wards hw ON hw.id = hb.ward_id
        WHERE hb.hospital_id = $1 ORDER BY hw.ward_name, hb.bed_number
    `, [hospitalId]);
    return result.rows;
};

const updateBedStatus = async (bedId, hospitalId, bedStatus) => {
    const result = await pool.query(`
        UPDATE hospital_beds SET bed_status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND hospital_id = $3
        RETURNING id AS bed_id, hospital_id, ward_id, bed_number, bed_status, created_at, updated_at
    `, [bedStatus, bedId, hospitalId]);
    return result.rows[0] || null;
};

const getPaymentsByHospitalId = async (hospitalId) => {
    const result = await pool.query(`
        SELECT p.id AS payment_id, p.reservation_id, p.total_amount, p.payment_method,
            p.payment_status, p.paid_at, p.created_at, r.medical_event_id,
            r.user_id AS patient_id, r.reservation_mode, r.reservation_status,
            r.requested_at, r.approved_at, u.phone AS patient_phone,
            up.first_name AS patient_first_name, up.last_name AS patient_last_name
        FROM payments p INNER JOIN reservations r ON p.reservation_id = r.id
        INNER JOIN users u ON r.user_id = u.id
        LEFT JOIN user_profiles up ON r.user_id = up.user_id
        WHERE r.hospital_id = $1 ORDER BY p.created_at DESC
    `, [hospitalId]);
    return result.rows;
};

const getPaymentById = async (paymentId, hospitalId) => {
    const result = await pool.query(`
        SELECT p.id AS payment_id, p.reservation_id, p.total_amount, p.payment_method,
            p.payment_status, p.paid_at, p.created_at, r.medical_event_id,
            r.user_id AS patient_id, r.hospital_id, r.ward_id, r.bed_id,
            r.reservation_mode, r.reservation_status, r.requested_at, r.approved_at,
            u.phone AS patient_phone, up.first_name AS patient_first_name,
            up.last_name AS patient_last_name, h.hospital_name, hw.ward_name, hb.bed_number
        FROM payments p INNER JOIN reservations r ON p.reservation_id = r.id
        INNER JOIN users u ON r.user_id = u.id
        LEFT JOIN user_profiles up ON r.user_id = up.user_id
        INNER JOIN hospitals h ON r.hospital_id = h.id
        INNER JOIN hospital_wards hw ON r.ward_id = hw.id
        LEFT JOIN hospital_beds hb ON r.bed_id = hb.id
        WHERE p.id = $1 AND r.hospital_id = $2 LIMIT 1
    `, [paymentId, hospitalId]);
    return result.rows[0] || null;
};

const createPayment = async ({ reservationId, totalAmount, paymentMethod, paymentStatus, paidAt }) => {
    const result = await pool.query(`
        INSERT INTO payments (reservation_id, total_amount, payment_method, payment_status, paid_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id AS payment_id, reservation_id, total_amount, payment_method,
            payment_status, paid_at, created_at
    `, [reservationId, totalAmount, paymentMethod, paymentStatus, paidAt]);
    return result.rows[0];
};

const getPaymentsByPatientId = async (patientId, hospitalId) => {
    const result = await pool.query(`
        SELECT p.id AS payment_id, p.reservation_id, p.total_amount, p.payment_method,
            p.payment_status, p.paid_at, p.created_at, r.medical_event_id,
            r.user_id AS patient_id, r.reservation_mode, r.reservation_status,
            r.requested_at, r.approved_at, h.hospital_name, hw.ward_name, hb.bed_number
        FROM payments p INNER JOIN reservations r ON p.reservation_id = r.id
        INNER JOIN hospitals h ON r.hospital_id = h.id
        INNER JOIN hospital_wards hw ON r.ward_id = hw.id
        LEFT JOIN hospital_beds hb ON r.bed_id = hb.id
        WHERE r.user_id = $1 AND r.hospital_id = $2 ORDER BY p.created_at DESC
    `, [patientId, hospitalId]);
    return result.rows;
};

const updatePayment = async (paymentId, hospitalId, { totalAmount, paymentMethod, paymentStatus, paidAt }) => {
    const result = await pool.query(`
        UPDATE payments p SET total_amount = COALESCE($3, p.total_amount),
            payment_method = COALESCE($4, p.payment_method),
            payment_status = COALESCE($5, p.payment_status),
            paid_at = COALESCE($6, p.paid_at)
        FROM reservations r
        WHERE p.id = $1 AND p.reservation_id = r.id AND r.hospital_id = $2
        RETURNING p.id AS payment_id, p.reservation_id, p.total_amount,
            p.payment_method, p.payment_status, p.paid_at, p.created_at
    `, [paymentId, hospitalId, totalAmount, paymentMethod, paymentStatus, paidAt]);
    return result.rows[0] || null;
};

module.exports = {
    getHospitalIdByAdminId, getHospitalByAdminId, getAssignmentsByAdminId,
    getDashboardByAdminId, getActiveCasesByHospitalId, getDashboardAnalyticsByHospitalId, getReservationsByHospital,
    getReservationById, approveReservation, getBedsByHospital, updateBedStatus,
    getPaymentsByHospitalId, getPaymentById, createPayment, getPaymentsByPatientId,
    updatePayment,
};
