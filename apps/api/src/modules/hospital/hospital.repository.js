const pool = require("../../infrastructure/database/postgres");

const getAllHospitals = async ({ limit, offset, sortBy }) => {
    let orderBy;

    switch (sortBy) {
        case "name":
            orderBy = "h.hospital_name ASC";
            break;
        case "createdAt":
            orderBy = "h.created_at DESC";
            break;
        default:
            orderBy = "h.hospital_name ASC";
    }

    const query = `
        SELECT
            h.id, h.hospital_name, h.license_number, h.email, h.phone,
            h.website, h.address,
            h.latitude::double precision AS latitude,
            h.longitude::double precision AS longitude,
            h.hospital_status, h.description, h.created_at, h.updated_at
        FROM hospitals h
        ORDER BY ${orderBy}
        LIMIT $1 OFFSET $2;
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
};

const getNearbyHospitals = async ({ radius, latitude, longitude }) => {
    const query = `
        SELECT
            h.id, h.hospital_name, h.license_number, h.email, h.phone,
            h.website, h.address,
            h.latitude::double precision AS latitude,
            h.longitude::double precision AS longitude,
            h.hospital_status, h.description, h.created_at, h.updated_at,
            (
                6371 * acos(
                    LEAST(1, GREATEST(-1,
                        cos(radians($1))
                        * cos(radians(h.latitude::double precision))
                        * cos(radians(h.longitude::double precision) - radians($2))
                        + sin(radians($1))
                        * sin(radians(h.latitude::double precision))
                    ))
                )
            ) AS distance_km
        FROM hospitals h
        WHERE (
            6371 * acos(
                LEAST(1, GREATEST(-1,
                    cos(radians($1))
                    * cos(radians(h.latitude::double precision))
                    * cos(radians(h.longitude::double precision) - radians($2))
                    + sin(radians($1))
                    * sin(radians(h.latitude::double precision))
                ))
            )
        ) <= $3
        ORDER BY distance_km ASC;
    `;

    const result = await pool.query(query, [latitude, longitude, radius]);
    return result.rows;
};

const getHospitalById = async (hospitalId) => {
    const hospitalQuery = `
        SELECT
            h.id, h.hospital_name, h.license_number, h.email, h.phone,
            h.website, h.address,
            h.latitude::double precision AS latitude,
            h.longitude::double precision AS longitude,
            h.hospital_status, h.description, h.created_at, h.updated_at
        FROM hospitals h
        WHERE h.id = $1;
    `;

    const hospitalResult = await pool.query(hospitalQuery, [hospitalId]);

    if (hospitalResult.rows.length === 0) {
        return null;
    }

    const hospital = hospitalResult.rows[0];

    const wardsQuery = `
        SELECT
            w.id, w.ward_name, w.description,
            COUNT(b.id)::integer AS total_beds,
            COUNT(b.id) FILTER (WHERE b.bed_status = 'AVAILABLE')::integer AS available_beds,
            COUNT(b.id) FILTER (WHERE b.bed_status = 'OCCUPIED')::integer AS occupied_beds,
            COUNT(b.id) FILTER (WHERE b.bed_status = 'RESERVED')::integer AS reserved_beds,
            COUNT(b.id) FILTER (WHERE b.bed_status = 'MAINTENANCE')::integer AS maintenance_beds
        FROM hospital_wards w
        LEFT JOIN hospital_beds b ON b.ward_id = w.id
        WHERE w.hospital_id = $1
        GROUP BY w.id, w.ward_name, w.description
        ORDER BY w.ward_name ASC;
    `;

    const wardsResult = await pool.query(wardsQuery, [hospitalId]);

    const bedsQuery = `
        SELECT b.id, b.ward_id, b.bed_number, b.bed_status, b.created_at, b.updated_at
        FROM hospital_beds b
        WHERE b.hospital_id = $1
        ORDER BY b.bed_number ASC;
    `;

    const bedsResult = await pool.query(bedsQuery, [hospitalId]);

    const icuWards = wardsResult.rows.filter((ward) =>
        ward.ward_name.toLowerCase().includes("icu")
    );

    const icuInformation = {
        totalBeds: icuWards.reduce(
            (total, ward) => total + Number(ward.total_beds), 0
        ),
        availableBeds: icuWards.reduce(
            (total, ward) => total + Number(ward.available_beds), 0
        ),
        occupiedBeds: icuWards.reduce(
            (total, ward) => total + Number(ward.occupied_beds), 0
        ),
        reservedBeds: icuWards.reduce(
            (total, ward) => total + Number(ward.reserved_beds), 0
        ),
        maintenanceBeds: icuWards.reduce(
            (total, ward) => total + Number(ward.maintenance_beds), 0
        ),
        wards: icuWards,
    };

    return {
        ...hospital,
        wards: wardsResult.rows,
        beds: bedsResult.rows,
        icu: icuInformation,
    };
};

module.exports = {
    getAllHospitals,
    getNearbyHospitals,
    getHospitalById,
};
