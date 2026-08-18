const { z } = require("zod");

// The legacy Payment API has no request parameters, query parameters, or body.
const paymentHistorySchema = z.object({});

module.exports = {
    paymentHistorySchema,
};
