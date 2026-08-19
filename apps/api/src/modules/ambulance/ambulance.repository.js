const pool = require("../../infrastructure/database/postgres");

const getAllAmbulances = async ({ limit, offset, sortBy }) => {
    let orderBy;

    switch (sortBy) {
        case "name":
            orderBy = "ap.provider_name ASC";
            break;
        case "createdAt":
            orderBy = "ap.created_at DESC";
            break;
        default:
            orderBy = "ap.provider_name ASC";
    }

    const query = `
        SELECT
            ap.id,
            ap.provider_name,
            ap.phone,
            ap.address,
            ap.latitude::double precision AS latitude,
            ap.longitude::double precision AS longitude,
            ap.is_active,
            ap.created_at,
            ap.updated_at
        FROM ambulance_providers ap
        ORDER BY ${orderBy}
        LIMIT $1
        OFFSET $2;
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
};

const getNearbyAmbulances = async ({ radius, latitude, longitude }) => {
    const query = `
        SELECT
            ap.id,
            ap.provider_name,
            ap.phone,
            ap.address,
            ap.latitude::double precision AS latitude,
            ap.longitude::double precision AS longitude,
            ap.is_active,
            ap.created_at,
            ap.updated_at,
            (
                6371 * acos(
                    LEAST(
                        1,
                        GREATEST(
                            -1,
                            cos(radians($1))
                            * cos(radians(ap.latitude::double precision))
                            * cos(radians(ap.longitude::double precision) - radians($2))
                            + sin(radians($1))
                            * sin(radians(ap.latitude::double precision))
                        )
                    )
                )
            ) AS distance_km
        FROM ambulance_providers ap
        WHERE
            ap.is_active = true
            AND (
                6371 * acos(
                    LEAST(
                        1,
                        GREATEST(
                            -1,
                            cos(radians($1))
                            * cos(radians(ap.latitude::double precision))
                            * cos(radians(ap.longitude::double precision) - radians($2))
                            + sin(radians($1))
                            * sin(radians(ap.latitude::double precision))
                        )
                    )
                )
            ) <= $3
        ORDER BY distance_km ASC;
    `;

    const result = await pool.query(query, [latitude, longitude, radius]);
    return result.rows;
};

const getAmbulanceById = async (ambulanceId) => {
    const query = `
        SELECT
            ap.id,
            ap.provider_name,
            ap.phone,
            ap.address,
            ap.latitude::double precision AS latitude,
            ap.longitude::double precision AS longitude,
            ap.is_active,
            ap.created_at,
            ap.updated_at
        FROM ambulance_providers ap
        WHERE ap.id = $1;
    `;

    const result = await pool.query(query, [ambulanceId]);
    return result.rows[0];
};

module.exports = {
    getAllAmbulances,
    getNearbyAmbulances,
    getAmbulanceById,
};
