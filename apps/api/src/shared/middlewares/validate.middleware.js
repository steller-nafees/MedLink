const validate = (schema, source = "body") => {
    return async (req, res, next) => {
        try {
            req[source] = await schema.parseAsync(
                req[source]
            );

            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                statusCode: 400,
                errors: error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });
        }
    };
};

module.exports = validate;
