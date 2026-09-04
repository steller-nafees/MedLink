const { z } = require("zod");

const donorListQuerySchema = z.object({
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),

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

  radius: z.coerce
    .number()
    .positive("Radius must be greater than 0")
    .max(100, "Radius cannot exceed 100 km")
    .optional(),

  latitude: z.coerce.number().min(-90).max(90).optional(),

  longitude: z.coerce.number().min(-180).max(180).optional(),
});

const donorIdParamSchema = z.object({
  donorId: z.string().uuid("Invalid donor ID"),
});

module.exports = {
  donorListQuerySchema,
  donorIdParamSchema,
};