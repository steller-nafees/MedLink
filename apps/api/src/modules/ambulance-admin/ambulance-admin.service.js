const ambulanceAdminRepository = require("./ambulance-admin.repository");

const getAmbulance = async (ambulanceId) => {
    const ambulance = await ambulanceAdminRepository.getAmbulanceById(ambulanceId);

    if (!ambulance) {
        const error = new Error("Ambulance provider not found");
        error.statusCode = 404;
        throw error;
    }

    return ambulance;
};

const updateAmbulance = async (ambulanceId, data) => {
    const existingAmbulance = await ambulanceAdminRepository.getAmbulanceById(
        ambulanceId
    );

    if (!existingAmbulance) {
        const error = new Error("Ambulance provider not found");
        error.statusCode = 404;
        throw error;
    }

    try {
        return await ambulanceAdminRepository.updateAmbulance(ambulanceId, data);
    } catch (error) {
        if (error.code === "23505") {
            const duplicateError = new Error("Phone number is already in use");
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw error;
    }
};

const deleteAmbulance = async (ambulanceId) => {
    const existingAmbulance = await ambulanceAdminRepository.getAmbulanceById(
        ambulanceId
    );

    if (!existingAmbulance) {
        const error = new Error("Ambulance provider not found");
        error.statusCode = 404;
        throw error;
    }

    await ambulanceAdminRepository.deleteAmbulance(ambulanceId);

    return { ambulanceId };
};

const updateAmbulanceContact = async (ambulanceId, phone) => {
    const existingAmbulance = await ambulanceAdminRepository.getAmbulanceById(
        ambulanceId
    );

    if (!existingAmbulance) {
        const error = new Error("Ambulance provider not found");
        error.statusCode = 404;
        throw error;
    }

    try {
        return await ambulanceAdminRepository.updateAmbulanceContact(
            ambulanceId,
            phone
        );
    } catch (error) {
        if (error.code === "23505") {
            const duplicateError = new Error("Phone number is already in use");
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw error;
    }
};

module.exports = {
    getAmbulance,
    updateAmbulance,
    deleteAmbulance,
    updateAmbulanceContact,
};
