const adminService = require("./admin.service");

// ============================================================
// GET ALL USERS
// ============================================================

const getAllUsers = async (req, res, next) => {
    try {
        const {
            limit = 50,
            offset = 0,
            userType,
            status,
        } = req.query;

        const result = await adminService.getAllUsers({
            limit: Number(limit),
            offset: Number(offset),
            userType,
            status,
        });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            statusCode: 200,
            count: result.users.length,
            total: result.total,
            data: result.users,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// UPDATE USER ROLE
// ============================================================

const updateUserRole = async (req, res, next) => {
    try {
        const user = await adminService.updateUserRole(
            req.params.userId,
            req.body.newRole,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            statusCode: 200,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// UPDATE USER STATUS
// ============================================================

const updateUserStatus = async (req, res, next) => {
    try {
        const user = await adminService.updateUserStatus(
            req.params.userId,
            req.body.status,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "User status updated successfully",
            statusCode: 200,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// GET ALL HOSPITALS
// ============================================================

const getAllHospitals = async (req, res, next) => {
    try {
        const {
            limit = 50,
            offset = 0,
            status,
        } = req.query;

        const result =
            await adminService.getAllHospitals({
                limit: Number(limit),
                offset: Number(offset),
                status,
            });

        return res.status(200).json({
            success: true,
            message: "Hospitals fetched successfully",
            statusCode: 200,
            count: result.hospitals.length,
            total: result.total,
            data: result.hospitals,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// GET HOSPITAL BY ID
// ============================================================

const getHospitalById = async (
    req,
    res,
    next
) => {
    try {
        const hospital =
            await adminService.getHospitalById(
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
        next(error);
    }
};

// ============================================================
// CREATE HOSPITAL
// ============================================================

const createHospital = async (req, res, next) => {
    try {
        const result =
            await adminService.createHospital(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Hospital and hospital admin created successfully",
            statusCode: 201,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// UPDATE HOSPITAL
// ============================================================

const updateHospital = async (req, res, next) => {
    try {
        const hospital =
            await adminService.updateHospital(
                req.params.hospitalId,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Hospital updated successfully",
            statusCode: 200,
            data: hospital,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// DELETE HOSPITAL
// ============================================================

const deleteHospital = async (req, res, next) => {
    try {
        const deletedHospital =
            await adminService.deleteHospital(
                req.params.hospitalId
            );

        return res.status(200).json({
            success: true,
            message:
                "Hospital deleted successfully",
            statusCode: 200,
            data: deletedHospital,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// GET ALL AMBULANCE PROVIDERS
// ============================================================

const getAllAmbulanceProviders = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await adminService.getAllAmbulanceProviders(
                req.query
            );

        return res.status(200).json({
            success: true,
            message:
                "Ambulance providers fetched successfully",
            statusCode: 200,
            total: result.total,
            limit: result.limit,
            offset: result.offset,
            count: result.providers.length,
            data: result.providers,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// GET AMBULANCE PROVIDER BY ID
// ============================================================

const getAmbulanceProviderById = async (
    req,
    res,
    next
) => {
    try {
        const provider =
            await adminService.getAmbulanceProviderById(
                req.params.ambulanceProviderId
            );

        return res.status(200).json({
            success: true,
            message:
                "Ambulance provider details fetched successfully",
            statusCode: 200,
            data: provider,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// CREATE AMBULANCE PROVIDER
// ============================================================

const createAmbulanceProvider = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await adminService.createAmbulanceProvider(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Ambulance provider registered successfully",
            statusCode: 201,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// UPDATE AMBULANCE PROVIDER
// ============================================================

const updateAmbulanceProvider = async (
    req,
    res,
    next
) => {
    try {
        const provider =
            await adminService.updateAmbulanceProvider(
                req.params.ambulanceProviderId,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Ambulance provider updated successfully",
            statusCode: 200,
            data: provider,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// DELETE AMBULANCE PROVIDER
// ============================================================

const deleteAmbulanceProvider = async (
    req,
    res,
    next
) => {
    try {
        const provider =
            await adminService.deleteAmbulanceProvider(
                req.params.ambulanceProviderId
            );

        return res.status(200).json({
            success: true,
            message:
                "Ambulance provider deleted successfully",
            statusCode: 200,
            data: provider,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// GET ADMIN DASHBOARD
// ============================================================

const getAdminDashboard = async (req, res, next) => {
    try {
        const dashboard =
            await adminService.getAdminDashboard();

        return res.status(200).json({
            success: true,
            message: "Admin dashboard fetched successfully",
            statusCode: 200,
            data: {
                totalUsers: Number(dashboard.total_users),
                totalHospitals: Number(dashboard.total_hospitals),
                totalAmbulanceProviders: Number(
                    dashboard.total_ambulance_providers
                ),
                totalReservations: Number(
                    dashboard.total_reservations
                ),
                usersThisMonth: Number(dashboard.users_this_month),
                usersLastMonth: Number(dashboard.users_last_month),
                driversThisMonth: Number(dashboard.drivers_this_month),
                pendingHospitals: Number(dashboard.pending_hospitals),
                reservationsThisMonth: Number(dashboard.reservations_this_month),
                reservationsLastMonth: Number(dashboard.reservations_last_month),
            },
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    getAllHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital,
    getAllAmbulanceProviders,
    getAmbulanceProviderById,
    createAmbulanceProvider,
    updateAmbulanceProvider,
    deleteAmbulanceProvider,
    getAdminDashboard,
};
