const hospitalService = require("../services/hospital.service");


// ============================================================
// GET ALL HOSPITALS
// ============================================================

const getHospitals = async (req, res) => {

    try {

        const hospitals =
            await hospitalService.getHospitals(
                req.query
            );

        return res.status(200).json({

            success: true,

            message:
                "Hospitals fetched successfully",

            statusCode: 200,

            count: hospitals.length,

            data: hospitals,

        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message: error.message,

            statusCode:
                error.statusCode || 500,

        });
    }
};


// ============================================================
// GET NEARBY HOSPITALS
// ============================================================

const getNearbyHospitals = async (req, res) => {

    try {

        const hospitals =
            await hospitalService.getHospitalsNearby(
                req.query
            );

        return res.status(200).json({

            success: true,

            message:
                "Nearby hospitals fetched successfully",

            statusCode: 200,

            count: hospitals.length,

            data: hospitals,

        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message: error.message,

            statusCode:
                error.statusCode || 500,

        });
    }
};


// ============================================================
// GET HOSPITAL DETAILS
// ============================================================

const getHospitalDetails = async (req, res) => {

    try {

        const hospital =
            await hospitalService.getHospitalDetails(
                req.params.hospitalId
            );

        return res.status(200).json({

            success: true,

            message:
                "Hospital details fetched successfully",

            statusCode: 200,

            data: hospital,

        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message: error.message,

            statusCode:
                error.statusCode || 500,

        });
    }
};


module.exports = {
    getHospitals,
    getNearbyHospitals,
    getHospitalDetails,
};