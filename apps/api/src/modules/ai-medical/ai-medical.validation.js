const { z } = require("zod");

const aiMedicalConsultSchema = z.object({
    userDescription: z
        .string()
        .trim()
        .min(5, "Medical description must be at least 5 characters")
        .max(5000, "Medical description cannot exceed 5000 characters"),
    latitude: z.coerce
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
    longitude: z.coerce
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
    isEmergency: z
        .boolean()
        .optional()
        .default(false),
});

module.exports = {
    aiMedicalConsultSchema,
};
