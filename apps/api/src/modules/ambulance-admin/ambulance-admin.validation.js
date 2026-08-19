const { z } = require("zod");

const ambulanceIdSchema = z.object({
    ambulanceId: z.string().uuid("Invalid ambulance ID"),
});

const updateAmbulanceSchema = z.object({
    providerName: z.string().min(1, "Provider name is required")
        .max(255, "Provider name is too long").trim(),
    phone: z.string().min(1, "Phone number is required")
        .max(20, "Phone number is too long").trim(),
    address: z.string().min(1, "Address is required").trim(),
    latitude: z.number().min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
    longitude: z.number().min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
    isActive: z.boolean(),
});

const updateAmbulanceContactSchema = z.object({
    phone: z.string().min(1, "Phone number is required")
        .max(20, "Phone number is too long").trim(),
});

module.exports = {
    ambulanceIdSchema,
    updateAmbulanceSchema,
    updateAmbulanceContactSchema,
};
