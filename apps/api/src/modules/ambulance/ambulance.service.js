const {
    getAllAmbulances,
    getNearbyAmbulances,
    getAmbulanceById,
} = require("./ambulance.repository");

const getAmbulanceProviders = async ({ limit, offset, sortBy }) => {
    return await getAllAmbulances({ limit, offset, sortBy });
};

const getAmbulanceProvidersNearby = async ({ radius, latitude, longitude }) => {
    const ambulances = await getNearbyAmbulances({
        radius,
        latitude,
        longitude,
    });

    return ambulances.map((ambulance) => ({
        ...ambulance,
        distance_km: Number(Number(ambulance.distance_km).toFixed(2)),
    }));
};

const getAmbulanceProviderDetails = async (ambulanceId) => {
    const ambulance = await getAmbulanceById(ambulanceId);

    if (!ambulance) {
        const error = new Error("Ambulance provider not found");
        error.statusCode = 404;
        throw error;
    }

    return ambulance;
};

module.exports = {
    getAmbulanceProviders,
    getAmbulanceProvidersNearby,
    getAmbulanceProviderDetails,
};
