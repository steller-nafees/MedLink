const ambulanceService = require("./ambulance.service");

const getAmbulances = async (req, res) => {
    try {
        const ambulances = await ambulanceService.getAmbulanceProviders(req.query);

        return res.status(200).json({
            success: true,
            message: "Ambulance providers fetched successfully",
            statusCode: 200,
            count: ambulances.length,
            data: ambulances,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const getNearbyAmbulances = async (req, res) => {
    try {
        const ambulances = await ambulanceService.getAmbulanceProvidersNearby(req.query);

        return res.status(200).json({
            success: true,
            message: "Nearby ambulance providers fetched successfully",
            statusCode: 200,
            count: ambulances.length,
            data: ambulances,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const getAmbulanceDetails = async (req, res) => {
    try {
        const ambulance = await ambulanceService.getAmbulanceProviderDetails(
            req.params.ambulanceId
        );

        return res.status(200).json({
            success: true,
            message: "Ambulance provider details fetched successfully",
            statusCode: 200,
            data: ambulance,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

module.exports = {
    getAmbulances,
    getNearbyAmbulances,
    getAmbulanceDetails,
};
