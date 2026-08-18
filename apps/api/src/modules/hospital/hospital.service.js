const {
    getAllHospitals,
    getNearbyHospitals,
    getHospitalById,
} = require("./hospital.repository");

const getHospitals = async ({ limit, offset, sortBy }) => {
    return await getAllHospitals({ limit, offset, sortBy });
};

const getHospitalsNearby = async ({ radius, latitude, longitude }) => {
    const hospitals = await getNearbyHospitals({
        radius,
        latitude,
        longitude,
    });

    return hospitals.map((hospital) => ({
        ...hospital,
        distance_km: Number(Number(hospital.distance_km).toFixed(2)),
    }));
};

const getHospitalDetails = async (hospitalId) => {
    const hospital = await getHospitalById(hospitalId);

    if (!hospital) {
        const error = new Error("Hospital not found");
        error.statusCode = 404;
        throw error;
    }

    return hospital;
};

module.exports = {
    getHospitals,
    getHospitalsNearby,
    getHospitalDetails,
};
