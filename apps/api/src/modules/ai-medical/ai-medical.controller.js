const aiMedicalService = require("./ai-medical.service");

const consult = async (req, res, next) => {
    try {
        const result = await aiMedicalService.consultMedicalCondition({
            userId: req.user.userId,
            userDescription: req.body.userDescription,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            isEmergency: req.body.isEmergency,
        });

        return res.status(201).json({
            success: true,
            message: "AI medical consultation completed successfully",
            statusCode: 201,
            data: {
                event: result.medicalEvent,
                aiResponse: result.aiResponse,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    consult,
};
