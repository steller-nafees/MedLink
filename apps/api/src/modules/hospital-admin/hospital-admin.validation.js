const { z } = require("zod");

const updateBedStatusSchema = z.object({
    bedStatus: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"]),
});

const assignBedSchema = z.object({
    bedNumber: z.union([z.string().min(1), z.number()]),
});

module.exports = { updateBedStatusSchema, assignBedSchema };
