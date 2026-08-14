const { z } = require("zod");

// ============================================================
// GET ALL EVENTS
// ============================================================

const eventListSchema = z.object({
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
});

// ============================================================
// GET EVENT BY ID
// ============================================================

const eventIdSchema = z.object({
    eventId: z.string().uuid("Invalid event ID"),
});

module.exports = {
    eventListSchema,
    eventIdSchema,
};