const pool = require("../../infrastructure/database/postgres");

const getAmbulanceById = async (ambulanceId) => {
    const query = `
        SELECT
            id,
            provider_name,
            phone,
            address,
            latitude,
            longitude,
            is_active,
            created_at,
            updated_at
        FROM ambulance_providers
        WHERE id = $1
    `;

    const { rows } = await pool.query(query, [ambulanceId]);

    return rows[0] || null;
};

const updateAmbulance = async (
    ambulanceId,
    {
        providerName,
        phone,
        address,
        latitude,
        longitude,
        isActive,
    }
) => {
    const query = `
        UPDATE ambulance_providers
        SET
            provider_name = $1,
            phone = $2,
            address = $3,
            latitude = $4,
            longitude = $5,
            is_active = $6
        WHERE id = $7
        RETURNING
            id,
            provider_name,
            phone,
            address,
            latitude,
            longitude,
            is_active,
            created_at,
            updated_at
    `;

    const values = [
        providerName,
        phone,
        address,
        latitude,
        longitude,
        isActive,
        ambulanceId,
    ];

    const { rows } = await pool.query(query, values);

    return rows[0] || null;
};

const deleteAmbulance = async (ambulanceId) => {
    const query = `
        DELETE FROM ambulance_providers
        WHERE id = $1
        RETURNING id
    `;

    const { rows } = await pool.query(query, [ambulanceId]);

    return rows[0] || null;
};

const updateAmbulanceContact = async (ambulanceId, phone) => {
    const query = `
        UPDATE ambulance_providers
        SET
            phone = $1
        WHERE id = $2
        RETURNING
            id,
            provider_name,
            phone,
            address,
            latitude,
            longitude,
            is_active,
            created_at,
            updated_at
    `;

    const { rows } = await pool.query(query, [phone, ambulanceId]);

    return rows[0] || null;
};

module.exports = {
    getAmbulanceById,
    updateAmbulance,
    deleteAmbulance,
    updateAmbulanceContact,
};
