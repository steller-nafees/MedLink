// const validate = (schema) => {
//   return async (req, res, next) => {
//     try {
//       req.body = await schema.parseAsync(req.body);
//       next();
//     } 
//     catch (error) 
//     {
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         statusCode: 400,
//         errors: error.issues.map((issue) => ({
//           field: issue.path[0],
//           message: issue.message,
//         })),
//       });
//     }
//   };
// };

// module.exports = validate;


//---------> used after hospital validation update

// const validate = (schema, source = "body") => {

//     return async (req, res, next) => {

//         try {

//             const validatedData =
//                 await schema.parseAsync(req[source]);

//             req[source] = validatedData;

//             next();

//         } catch (error) {

//             return res.status(400).json({

//                 success: false,

//                 message: "Validation error",

//                 statusCode: 400,

//                 errors: error.issues.map((issue) => ({

//                     field: issue.path[0],

//                     message: issue.message,

//                 })),

//             });

//         }

//     };

// };


//-----------> used after ambulance validation update

// const validate = (schema, source = "body") => {

//     return async (req, res, next) => {

//         try {

//             const validatedData =
//                 await schema.parseAsync(req[source]);

//             req[source] = validatedData;

//             next();

//         } catch (error) {

//             return res.status(400).json({

//                 success: false,

//                 message: "Validation error",

//                 statusCode: 400,

//                 errors: error.issues.map((issue) => ({

//                     field: issue.path.join("."),

//                     message: issue.message,

//                 })),

//             });

//         }

//     };

// };

// module.exports = validate;


//   -----------------> used after event validation update

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