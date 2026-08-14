const { z } = require("zod");

// ============================================================
// GET ALL AMBULANCE PROVIDERS
// ============================================================

const ambulanceListSchema = z.object({
    limit: z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .optional()
        .default(20),

    offset: z.coerce
        .number()
        .int()
        .min(0, "Offset cannot be negative")
        .optional()
        .default(0),

    sortBy: z
        .enum(["name", "createdAt"], {
            message: "sortBy must be either name or createdAt",
        })
        .optional()
        .default("name"),
});

// ============================================================
// GET NEARBY AMBULANCE PROVIDERS
// ============================================================

const nearbyAmbulanceSchema = z.object({
    radius: z.coerce
        .number()
        .positive("Radius must be greater than 0")
        .max(100, "Radius cannot exceed 100 km")
        .optional()
        .default(10),

    latitude: z.coerce
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),

    longitude: z.coerce
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
});

// ============================================================
// GET AMBULANCE PROVIDER BY ID
// ============================================================

const ambulanceIdSchema = z.object({
    ambulanceId: z.string().uuid("Invalid ambulance ID"),
});

module.exports = {
    ambulanceListSchema,
    nearbyAmbulanceSchema,
    ambulanceIdSchema,
};