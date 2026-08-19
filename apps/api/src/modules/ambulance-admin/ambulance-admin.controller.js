const ambulanceAdminService = require("./ambulance-admin.service");

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message,
        statusCode,
    });
};

const getAmbulance = async (req, res) => {
    try {
        const ambulance = await ambulanceAdminService.getAmbulance(
            req.params.ambulanceId
        );

        return res.status(200).json({
            success: true,
            message: "Ambulance information fetched successfully",
            statusCode: 200,
            data: ambulance,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateAmbulance = async (req, res) => {
    try {
        const ambulance = await ambulanceAdminService.updateAmbulance(
            req.params.ambulanceId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Ambulance information updated successfully",
            statusCode: 200,
            data: ambulance,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteAmbulance = async (req, res) => {
    try {
        const result = await ambulanceAdminService.deleteAmbulance(
            req.params.ambulanceId
        );

        return res.status(200).json({
            success: true,
            message: "Ambulance provider removed successfully",
            statusCode: 200,
            data: result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateAmbulanceContact = async (req, res) => {
    try {
        const ambulance = await ambulanceAdminService.updateAmbulanceContact(
            req.params.ambulanceId,
            req.body.phone
        );

        return res.status(200).json({
            success: true,
            message: "Ambulance contact updated successfully",
            statusCode: 200,
            data: ambulance,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

module.exports = {
    getAmbulance,
    updateAmbulance,
    deleteAmbulance,
    updateAmbulanceContact,
};
