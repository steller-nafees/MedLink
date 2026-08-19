const { z } = require("zod");

const updateBedStatusSchema = z.object({
    bedStatus: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"]),
});

module.exports = { updateBedStatusSchema };
