const pool = require("../config/db");

const createUserProfile = async ({
    userId,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    nationalId,
    address,
    emergencyContactName,
    emergencyContactPhone,
    bloodGroup,
}) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // Insert into user_profiles

        const profileQuery = `
            INSERT INTO user_profiles
            (
                user_id,
                first_name,
                last_name,
                gender,
                date_of_birth,
                national_id,
                address,
                emergency_contact_name,
                emergency_contact_phone
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *;
        `;

        const profileResult = await client.query(profileQuery, [
            userId,
            firstName,
            lastName,
            gender,
            dateOfBirth,
            nationalId,
            address,
            emergencyContactName,
            emergencyContactPhone,
        ]);

        // Insert into blood_information

        const bloodQuery = `
            INSERT INTO blood_information
            (
                user_id,
                blood_group
            )
            VALUES
            ($1,$2)
            RETURNING *;
        `;

        const bloodResult = await client.query(bloodQuery, [
            userId,
            bloodGroup,
        ]);

        await client.query("COMMIT");

        return {
            profile: profileResult.rows[0],
            blood: bloodResult.rows[0],
        };

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }

};

const getProfileByUserId = async (userId) => {
    const query = `
        SELECT
            u.id,
            u.email,
            u.phone,
            u.role_type,

            up.first_name,
            up.last_name,
            up.gender,
            up.date_of_birth,
            up.national_id,
            up.address,
            up.emergency_contact_name,
            up.emergency_contact_phone,

            bi.blood_group,
            bi.last_donation_date,
            bi.can_donate,
            bi.next_available_date,
            bi.is_available_for_donation

        FROM users u

        LEFT JOIN user_profiles up
            ON up.user_id = u.id

        LEFT JOIN blood_information bi
            ON bi.user_id = u.id

        WHERE u.id = $1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
};

const updateUserProfile = async (
    userId,
    {
        firstName,
        lastName,
        gender,
        dateOfBirth,
        nationalId,
        address,
        emergencyContactName,
        emergencyContactPhone,
        bloodGroup,
    }
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const profileQuery = `
            UPDATE user_profiles
            SET
                first_name = $2,
                last_name = $3,
                gender = $4,
                date_of_birth = $5,
                national_id = $6,
                address = $7,
                emergency_contact_name = $8,
                emergency_contact_phone = $9
            WHERE user_id = $1
            RETURNING *;
        `;

        const profile = await client.query(profileQuery, [
            userId,
            firstName,
            lastName,
            gender,
            dateOfBirth,
            nationalId,
            address,
            emergencyContactName,
            emergencyContactPhone,
        ]);

        const bloodQuery = `
            UPDATE blood_information
            SET
                blood_group = $2
            WHERE user_id = $1
            RETURNING *;
        `;

        const blood = await client.query(bloodQuery, [
            userId,
            bloodGroup,
        ]);

        await client.query("COMMIT");

        return {
            profile: profile.rows[0],
            blood: blood.rows[0],
        };

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }

};

const getUserById = async (userId) => {
    const query = `
        SELECT
            u.id,
            u.email,
            u.phone,
            u.role_type,
            u.is_verified,
            u.is_active,
            u.last_login,
            u.created_at,

            up.first_name,
            up.last_name,
            up.gender,
            up.date_of_birth,
            up.national_id,
            up.address,
            up.emergency_contact_name,
            up.emergency_contact_phone,

            bi.blood_group,
            bi.last_donation_date,
            bi.can_donate,
            bi.next_available_date,
            bi.is_available_for_donation

        FROM users u

        LEFT JOIN user_profiles up
            ON up.user_id = u.id

        LEFT JOIN blood_information bi
            ON bi.user_id = u.id

        WHERE u.id = $1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
};

const getAllUsers = async () => {
    const query = `
        SELECT
            u.id,
            u.email,
            u.phone,
            u.role_type,
            u.is_verified,
            u.is_active,
            u.last_login,
            u.created_at,

            up.first_name,
            up.last_name,
            up.gender,
            up.date_of_birth,
            up.national_id,
            up.address,

            bi.blood_group,
            bi.can_donate,
            bi.is_available_for_donation

        FROM users u

        LEFT JOIN user_profiles up
            ON up.user_id = u.id

        LEFT JOIN blood_information bi
            ON bi.user_id = u.id

        ORDER BY u.created_at DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
};

const updateUserRole = async (userId, roleType) => {

    const query = `
        UPDATE users
        SET
            role_type = $2
        WHERE id = $1
        RETURNING
            id,
            email,
            phone,
            role_type,
            updated_at;
    `;

    const result = await pool.query(query, [
        userId,
        roleType,
    ]);

    return result.rows[0];

};

const deleteUser = async (userId) => {
    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id, email;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];
};

const getUserLocation = async (userId) => {

    const query = `
        SELECT
            id,
            user_id,
            latitude,
            longitude,
            updated_at
        FROM user_locations
        WHERE user_id = $1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0];

};

const upsertUserLocation = async ({
    userId,
    latitude,
    longitude,
}) => {

    const query = `
        INSERT INTO user_locations
        (
            user_id,
            latitude,
            longitude
        )

        VALUES
        (
            $1,
            $2,
            $3
        )

        ON CONFLICT (user_id)

        DO UPDATE SET

            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            updated_at = CURRENT_TIMESTAMP

        RETURNING *;
    `;

    const result = await pool.query(query, [
        userId,
        latitude,
        longitude,
    ]);

    return result.rows[0];

};

const createEmergencyProfile = async ({
    userId,
    name,
}) => {

    const query = `
        INSERT INTO user_profiles
        (
            user_id,
            first_name
        )
        VALUES
        (
            $1,
            $2
        )
        RETURNING *;
    `;

    const result = await pool.query(query, [
        userId,
        name,
    ]);

    return result.rows[0];
};

module.exports = {
    createUserProfile,
    getProfileByUserId,
    updateUserProfile,
    getUserById,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getUserLocation,
    upsertUserLocation,
    createEmergencyProfile,
};
