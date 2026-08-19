const userService = require("./user.service");

const completeProfile = async (req, res) => {
    try {
        const result = await userService.completeProfile(
            req.user.userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Profile completed successfully",
            statusCode: 201,
            data: {
                profile: result.profile,
                bloodInformation: result.blood,
            },
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await userService.getProfile(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            statusCode: 200,
            data: profile,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const result = await userService.updateProfile(
            req.user.userId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            statusCode: 200,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const user = await userService.getUserDetails(
            req.params.userId
        );

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            statusCode: 200,
            data: user,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsersService();

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            statusCode: 200,
            count: users.length,
            data: users,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const updateRole = async (req, res) => {
    try {
        const user = await userService.updateRole(
            req.params.userId,
            req.body.roleType
        );

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            statusCode: 200,
            data: user,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const deleteUserAccount = async (req, res) => {
    try {
        await userService.deleteUserAccount(
            req.user,
            req.params.userId
        );

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            statusCode: 200,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const getMyLocation = async (req, res) => {
    try {
        const location = await userService.getMyLocation(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Location fetched successfully",
            statusCode: 200,
            data: location,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const updateMyLocation = async (req, res) => {
    try {
        const location = await userService.updateMyLocation(
            req.user.userId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Location updated successfully",
            statusCode: 200,
            data: location,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message,
        });
    }
};

module.exports = {
    completeProfile,
    getProfile,
    updateProfile,
    getUserDetails,
    getAllUsers,
    updateRole,
    deleteUserAccount,
    getMyLocation,
    updateMyLocation,
    getUserById,
};