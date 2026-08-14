const { z } = require("zod");

// ============================================================
// CREATE RESERVATION
// ============================================================

const createReservationSchema = z.object({
    medicalEventId: z
        .string()
        .uuid("Invalid medical event ID"),

    hospitalId: z
        .string()
        .uuid("Invalid hospital ID"),

    wardId: z
        .string()
        .uuid("Invalid ward ID"),

    bedId: z
        .string()
        .uuid("Invalid bed ID")
        .optional()
        .nullable(),

    reservationMode: z
        .enum(["NORMAL", "EMERGENCY"], {
            message:
                "reservationMode must be either NORMAL or EMERGENCY",
        }),
});

// ============================================================
// UPDATE RESERVATION
// ============================================================

const updateReservationSchema = z.object({
    hospitalId: z
        .string()
        .uuid("Invalid hospital ID")
        .optional(),

    wardId: z
        .string()
        .uuid("Invalid ward ID")
        .optional(),

    bedId: z
        .string()
        .uuid("Invalid bed ID")
        .optional()
        .nullable(),
});

// ============================================================
// RESERVATION ID
// ============================================================

const reservationIdSchema = z.object({
    reservationId: z
        .string()
        .uuid("Invalid reservation ID"),
});

module.exports = {
    createReservationSchema,
    updateReservationSchema,
    reservationIdSchema,
};