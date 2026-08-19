const pool = require("../../infrastructure/database/postgres");

const getPaymentsByCustomerId = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            p.id AS payment_id,
            p.reservation_id,
            p.total_amount,
            p.payment_method,
            p.payment_status,
            p.paid_at,
            p.created_at,

            r.medical_event_id,
            r.hospital_id,
            r.ward_id,
            r.bed_id,
            r.reservation_mode,
            r.reservation_status,
            r.requested_at,
            r.approved_at,

            h.hospital_name,

            hw.ward_name,

            hb.bed_number

        FROM payments p

        INNER JOIN reservations r
            ON p.reservation_id = r.id

        INNER JOIN hospitals h
            ON r.hospital_id = h.id

        INNER JOIN hospital_wards hw
            ON r.ward_id = hw.id

        LEFT JOIN hospital_beds hb
            ON r.bed_id = hb.id

        WHERE r.user_id = $1

        ORDER BY p.created_at DESC
        `,
        [userId]
    );

    return result.rows;
};

module.exports = {
    getPaymentsByCustomerId,
};
