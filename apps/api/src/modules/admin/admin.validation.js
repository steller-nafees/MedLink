const { z } = require("zod");

// ============================================================
// UPDATE USER ROLE
// ============================================================

const updateUserRoleSchema = z.object({
    newRole: z.enum(
        [
            "CUSTOMER",
            "SUPER_ADMIN",
            "HOSPITAL_ADMIN",
            "AMBULANCE_ADMIN",
        ],
        {
            message: "Invalid user role",
        }
    ),
});

// ============================================================
// UPDATE USER STATUS
// ============================================================

const updateUserStatusSchema = z.object({
    status: z.enum(
        ["active", "inactive"],
        {
            message: "Status must be either active or inactive",
        }
    ),
});

// ============================================================
// HOSPITAL VALIDATIONS
// ============================================================

const createHospitalSchema = z.object({
    hospital: z.object({
        hospitalName: z
            .string()
            .min(1, "Hospital name is required")
            .trim(),

        licenseNumber: z
            .string()
            .min(1, "License number is required")
            .trim(),

        email: z
            .string()
            .email("Please provide a valid hospital email")
            .trim(),

        phone: z
            .string()
            .min(1, "Hospital phone is required")
            .trim(),

        website: z
            .string()
            .url("Please provide a valid website URL")
            .trim()
            .optional(),

        address: z
            .string()
            .min(1, "Hospital address is required")
            .trim(),

        latitude: z
            .number()
            .min(-90, "Latitude must be between -90 and 90")
            .max(90, "Latitude must be between -90 and 90"),

        longitude: z
            .number()
            .min(-180, "Longitude must be between -180 and 180")
            .max(180, "Longitude must be between -180 and 180"),

        hospitalStatus: z
            .enum([
                "OPEN",
                "CLOSED",
                "UNDER_MAINTENANCE",
            ])
            .optional()
            .default("OPEN"),

        description: z
            .string()
            .trim()
            .optional(),
    }),

    admin: z.object({
        email: z.string().email("Please provide a valid admin email")
            .trim(),

        phone: z
            .string()
            .min(1, "Admin phone is required")
            .trim(),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),
    }),
});


// ============================================================
// UPDATE HOSPITAL
// ============================================================

const updateHospitalSchema = z
    .object({
        hospitalName: z
            .string()
            .min(1, "Hospital name cannot be empty")
            .trim()
            .optional(),

        licenseNumber: z
            .string()
            .min(1, "License number cannot be empty")
            .trim()
            .optional(),

        email: z.string().email("Please provide a valid hospital email")
            .trim()
            .optional(),

        phone: z
            .string()
            .min(1, "Hospital phone cannot be empty")
            .trim()
            .optional(),

        website: z
            .string()
            .url("Please provide a valid website URL")
            .trim()
            .nullable()
            .optional(),

        address: z
            .string()
            .min(1, "Hospital address cannot be empty")
            .trim()
            .optional(),

        latitude: z
            .number()
            .min(-90)
            .max(90)
            .optional(),

        longitude: z
            .number()
            .min(-180)
            .max(180)
            .optional(),

        hospitalStatus: z
            .enum([
                "OPEN",
                "CLOSED",
                "UNDER_MAINTENANCE",
            ])
            .optional(),

        description: z
            .string()
            .trim()
            .nullable()
            .optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message:
                "At least one field is required to update the hospital",
        }
    );

const userIdParamSchema = z.object({
    userId: z.string().uuid("Invalid user ID"),
});

module.exports = {
    updateUserRoleSchema,
    updateUserStatusSchema,
    createHospitalSchema,
    updateHospitalSchema,
    userIdParamSchema,
};

