const pool = require("../config/db");

// ============================================================
// CREATE RESERVATION
// ============================================================

const createReservation = async ({
    medicalEventId,
    userId,
    hospitalId,
    wardId,
    bedId,
    reservationMode,
}) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ----------------------------------------------------
        // Verify medical event belongs to authenticated user
        // ----------------------------------------------------

        const eventQuery = `
            SELECT
                id,
                user_id,
                event_status,
                is_emergency

            FROM medical_events

            WHERE id = $1
            FOR UPDATE;
        `;

        const eventResult = await client.query(
            eventQuery,
            [medicalEventId]
        );

        if (eventResult.rows.length === 0) {

            const error = new Error(
                "Medical event not found"
            );

            error.statusCode = 404;

            throw error;
        }

        const event = eventResult.rows[0];

        if (event.user_id !== userId) {

            const error = new Error(
                "You can only create a reservation for your own medical event"
            );

            error.statusCode = 403;

            throw error;
        }

        // ----------------------------------------------------
        // Prevent reservation for completed/cancelled event
        // ----------------------------------------------------

        if (
            event.event_status === "COMPLETED" ||
            event.event_status === "CANCELLED"
        ) {

            const error = new Error(
                "Reservation cannot be created for a completed or cancelled medical event"
            );

            error.statusCode = 400;

            throw error;
        }

        // ----------------------------------------------------
        // Verify hospital exists
        // ----------------------------------------------------

        const hospitalQuery = `
            SELECT
                id,
                hospital_status

            FROM hospitals

            WHERE id = $1;
        `;

        const hospitalResult = await client.query(
            hospitalQuery,
            [hospitalId]
        );

        if (hospitalResult.rows.length === 0) {

            const error = new Error(
                "Hospital not found"
            );

            error.statusCode = 404;

            throw error;
        }

        const hospital = hospitalResult.rows[0];

        if (hospital.hospital_status !== "OPEN") {

            const error = new Error(
                "Hospital is not currently open"
            );

            error.statusCode = 400;

            throw error;
        }

        // ----------------------------------------------------
        // Verify ward belongs to hospital
        // ----------------------------------------------------

        const wardQuery = `
            SELECT id
            FROM hospital_wards
            WHERE id = $1
            AND hospital_id = $2;
        `;

        const wardResult = await client.query(
            wardQuery,
            [
                wardId,
                hospitalId,
            ]
        );

        if (wardResult.rows.length === 0) {

            const error = new Error(
                "Ward does not belong to the selected hospital"
            );

            error.statusCode = 400;

            throw error;
        }

        // ----------------------------------------------------
        // Verify bed if provided
        // ----------------------------------------------------

        if (bedId) {

            const bedQuery = `
                SELECT
                    id,
                    hospital_id,
                    ward_id,
                    bed_status

                FROM hospital_beds

                WHERE id = $1

                FOR UPDATE;
            `;

            const bedResult = await client.query(
                bedQuery,
                [bedId]
            );

            if (bedResult.rows.length === 0) {

                const error = new Error(
                    "Bed not found"
                );

                error.statusCode = 404;

                throw error;
            }

            const bed = bedResult.rows[0];

            if (
                bed.hospital_id !== hospitalId ||
                bed.ward_id !== wardId
            ) {

                const error = new Error(
                    "Bed does not belong to the selected hospital and ward"
                );

                error.statusCode = 400;

                throw error;
            }

            if (bed.bed_status !== "AVAILABLE") {

                const error = new Error(
                    "Selected bed is not available"
                );

                error.statusCode = 400;

                throw error;
            }
        }

        // ----------------------------------------------------
        // Prevent duplicate active reservation
        // ----------------------------------------------------

        const duplicateQuery = `
            SELECT id

            FROM reservations

            WHERE medical_event_id = $1
            AND user_id = $2

            AND reservation_status IN (
                'PENDING',
                'APPROVED'
            )

            LIMIT 1;
        `;

        const duplicateResult = await client.query(
            duplicateQuery,
            [
                medicalEventId,
                userId,
            ]
        );

        if (duplicateResult.rows.length > 0) {

            const error = new Error(
                "An active reservation already exists for this medical event"
            );

            error.statusCode = 409;

            throw error;
        }

        // ----------------------------------------------------
        // Create reservation
        // ----------------------------------------------------

        const insertQuery = `
            INSERT INTO reservations (
                medical_event_id,
                user_id,
                hospital_id,
                ward_id,
                bed_id,
                reservation_mode
            )

            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )

            RETURNING
                id,
                medical_event_id,
                user_id,
                hospital_id,
                ward_id,
                bed_id,
                reservation_mode,
                reservation_status,
                requested_at,
                approved_at,
                created_at,
                updated_at;
        `;

        const insertResult = await client.query(
            insertQuery,
            [
                medicalEventId,
                userId,
                hospitalId,
                wardId,
                bedId || null,
                reservationMode,
            ]
        );

        // ----------------------------------------------------
        // If a specific bed is reserved, mark it RESERVED
        // ----------------------------------------------------

        if (bedId) {

            await client.query(
                `
                UPDATE hospital_beds

                SET bed_status = 'RESERVED'

                WHERE id = $1;
                `,
                [bedId]
            );
        }

        await client.query("COMMIT");

        return insertResult.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();
    }
};

// ============================================================
// GET ALL RESERVATIONS FOR USER
// ============================================================

const getAllReservations = async (userId) => {

    const query = `
        SELECT
            r.id,

            r.medical_event_id,
            r.user_id,

            r.hospital_id,
            h.hospital_name,

            r.ward_id,
            w.ward_name,

            r.bed_id,
            b.bed_number,

            r.reservation_mode,
            r.reservation_status,

            r.requested_at,
            r.approved_at,
            r.created_at,
            r.updated_at

        FROM reservations r

        INNER JOIN hospitals h
            ON h.id = r.hospital_id

        INNER JOIN hospital_wards w
            ON w.id = r.ward_id

        LEFT JOIN hospital_beds b
            ON b.id = r.bed_id

        WHERE r.user_id = $1

        ORDER BY r.created_at DESC;
    `;

    const result = await pool.query(
        query,
        [userId]
    );

    return result.rows;
};

// ============================================================
// GET RESERVATION BY ID
// ============================================================

const getReservationById = async (
    reservationId,
    userId
) => {

    const query = `
        SELECT
            r.id,

            r.medical_event_id,
            r.user_id,

            r.hospital_id,
            h.hospital_name,

            r.ward_id,
            w.ward_name,

            r.bed_id,
            b.bed_number,

            r.reservation_mode,
            r.reservation_status,

            r.requested_at,
            r.approved_at,
            r.created_at,
            r.updated_at

        FROM reservations r

        INNER JOIN hospitals h
            ON h.id = r.hospital_id

        INNER JOIN hospital_wards w
            ON w.id = r.ward_id

        LEFT JOIN hospital_beds b
            ON b.id = r.bed_id

        WHERE r.id = $1
        AND r.user_id = $2;
    `;

    const result = await pool.query(
        query,
        [
            reservationId,
            userId,
        ]
    );

    return result.rows[0] || null;
};

// ============================================================
// UPDATE RESERVATION
// ============================================================

const updateReservation = async ({
    reservationId,
    userId,
    hospitalId,
    wardId,
    bedId,
}) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ----------------------------------------------------
        // Get existing reservation
        // ----------------------------------------------------

        const reservationQuery = `
            SELECT *
            FROM reservations

            WHERE id = $1
            AND user_id = $2

            FOR UPDATE;
        `;

        const reservationResult = await client.query(
            reservationQuery,
            [
                reservationId,
                userId,
            ]
        );

        if (reservationResult.rows.length === 0) {

            const error = new Error(
                "Reservation not found"
            );

            error.statusCode = 404;

            throw error;
        }

        const reservation = reservationResult.rows[0];

        if (
            reservation.reservation_status !== "PENDING"
        ) {

            const error = new Error(
                "Only pending reservations can be updated"
            );

            error.statusCode = 400;

            throw error;
        }

        const newHospitalId =
            hospitalId || reservation.hospital_id;

        const newWardId =
            wardId || reservation.ward_id;

        const newBedId =
            bedId !== undefined
                ? bedId
                : reservation.bed_id;

        // ----------------------------------------------------
        // Verify hospital
        // ----------------------------------------------------

        const hospitalResult = await client.query(
            `
            SELECT id, hospital_status
            FROM hospitals
            WHERE id = $1;
            `,
            [newHospitalId]
        );

        if (hospitalResult.rows.length === 0) {

            const error = new Error(
                "Hospital not found"
            );

            error.statusCode = 404;

            throw error;
        }

        if (
            hospitalResult.rows[0].hospital_status !== "OPEN"
        ) {

            const error = new Error(
                "Hospital is not currently open"
            );

            error.statusCode = 400;

            throw error;
        }

        // ----------------------------------------------------
        // Verify ward
        // ----------------------------------------------------

        const wardResult = await client.query(
            `
            SELECT id
            FROM hospital_wards

            WHERE id = $1
            AND hospital_id = $2;
            `,
            [
                newWardId,
                newHospitalId,
            ]
        );

        if (wardResult.rows.length === 0) {

            const error = new Error(
                "Ward does not belong to the selected hospital"
            );

            error.statusCode = 400;

            throw error;
        }

        // ----------------------------------------------------
        // Release old bed if changing/removing it
        // ----------------------------------------------------

        if (
            reservation.bed_id &&
            reservation.bed_id !== newBedId
        ) {

            await client.query(
                `
                UPDATE hospital_beds

                SET bed_status = 'AVAILABLE'

                WHERE id = $1
                AND bed_status = 'RESERVED';
                `,
                [reservation.bed_id]
            );
        }

        // ----------------------------------------------------
        // Verify and reserve new bed
        // ----------------------------------------------------

        if (newBedId) {

            const bedResult = await client.query(
                `
                SELECT
                    id,
                    hospital_id,
                    ward_id,
                    bed_status

                FROM hospital_beds

                WHERE id = $1

                FOR UPDATE;
                `,
                [newBedId]
            );

            if (bedResult.rows.length === 0) {

                const error = new Error(
                    "Bed not found"
                );

                error.statusCode = 404;

                throw error;
            }

            const bed = bedResult.rows[0];

            if (
                bed.hospital_id !== newHospitalId ||
                bed.ward_id !== newWardId
            ) {

                const error = new Error(
                    "Bed does not belong to the selected hospital and ward"
                );

                error.statusCode = 400;

                throw error;
            }

            if (
                bed.bed_status !== "AVAILABLE" &&
                bed.id !== reservation.bed_id
            ) {

                const error = new Error(
                    "Selected bed is not available"
                );

                error.statusCode = 400;

                throw error;
            }

            await client.query(
                `
                UPDATE hospital_beds

                SET bed_status = 'RESERVED'

                WHERE id = $1;
                `,
                [newBedId]
            );
        }

        // ----------------------------------------------------
        // Update reservation
        // ----------------------------------------------------

        const updateResult = await client.query(
            `
            UPDATE reservations

            SET
                hospital_id = $1,
                ward_id = $2,
                bed_id = $3

            WHERE id = $4
            AND user_id = $5

            RETURNING
                id,
                medical_event_id,
                user_id,
                hospital_id,
                ward_id,
                bed_id,
                reservation_mode,
                reservation_status,
                requested_at,
                approved_at,
                created_at,
                updated_at;
            `,
            [
                newHospitalId,
                newWardId,
                newBedId || null,
                reservationId,
                userId,
            ]
        );

        await client.query("COMMIT");

        return updateResult.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();
    }
};

// ============================================================
// CANCEL RESERVATION
// ============================================================

const cancelReservation = async (
    reservationId,
    userId
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ----------------------------------------------------
        // Get reservation
        // ----------------------------------------------------

        const reservationResult = await client.query(
            `
            SELECT
                id,
                bed_id,
                reservation_status

            FROM reservations

            WHERE id = $1
            AND user_id = $2

            FOR UPDATE;
            `,
            [
                reservationId,
                userId,
            ]
        );

        if (reservationResult.rows.length === 0) {

            const error = new Error(
                "Reservation not found"
            );

            error.statusCode = 404;

            throw error;
        }

        const reservation =
            reservationResult.rows[0];

        if (
            reservation.reservation_status ===
            "CANCELLED"
        ) {

            const error = new Error(
                "Reservation is already cancelled"
            );

            error.statusCode = 400;

            throw error;
        }

        if (
            reservation.reservation_status ===
            "COMPLETED"
        ) {

            const error = new Error(
                "Completed reservations cannot be cancelled"
            );

            error.statusCode = 400;

            throw error;
        }

        // ----------------------------------------------------
        // Cancel reservation
        // ----------------------------------------------------

        const result = await client.query(
            `
            UPDATE reservations

            SET reservation_status = 'CANCELLED'

            WHERE id = $1
            AND user_id = $2

            RETURNING
                id,
                medical_event_id,
                user_id,
                hospital_id,
                ward_id,
                bed_id,
                reservation_mode,
                reservation_status,
                requested_at,
                approved_at,
                created_at,
                updated_at;
            `,
            [
                reservationId,
                userId,
            ]
        );

        // ----------------------------------------------------
        // Release reserved bed
        // ----------------------------------------------------

        if (reservation.bed_id) {

            await client.query(
                `
                UPDATE hospital_beds

                SET bed_status = 'AVAILABLE'

                WHERE id = $1
                AND bed_status = 'RESERVED';
                `,
                [reservation.bed_id]
            );
        }

        await client.query("COMMIT");

        return result.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();
    }
};

module.exports = {
    createReservation,
    getAllReservations,
    getReservationById,
    updateReservation,
    cancelReservation,
};