const {
    createUserProfile,
    getProfileByUserId,
    updateUserProfile,
    getUserById,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getUserLocation,
    upsertUserLocation,
} = require("./user.repository");

const completeProfile = async (userId, data) => {
    try {
        return await createUserProfile({
            userId,
            ...data,
        });
    } catch (error) {
        if (error.code === "23505") {
            if (error.constraint === "user_profiles_national_id_key") {
                const err = new Error("National ID already exists");
                err.statusCode = 409;
                throw err;
            }

            if (error.constraint === "blood_information_user_id_key") {
                const err = new Error("Profile already completed");
                err.statusCode = 409;
                throw err;
            }
        }

        throw error;
    }
};

const getProfile = async (userId) => {
    const profile = await getProfileByUserId(userId);

    if (!profile) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return profile;
};

const updateProfile = async (userId, body) => {
    return await updateUserProfile(userId, body);
};

const getUserDetails = async (userId) => {
    const user = await getUserById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

const getAllUsersService = async () => {
    return await getAllUsers();
};

const updateRole = async (userId, roleType) => {
    const user = await getUserById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return await updateUserRole(userId, roleType);
};

const deleteUserAccount = async (requestUser, targetUserId) => {
    if (
        requestUser.role !== "SUPER_ADMIN" &&
        requestUser.userId !== targetUserId
    ) {
        const error = new Error("You can delete only your own account");
        error.statusCode = 403;
        throw error;
    }

    const deletedUser = await deleteUser(targetUserId);

    if (!deletedUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return deletedUser;
};

const getMyLocation = async (userId) => {
    const location = await getUserLocation(userId);

    if (!location) {
        const error = new Error("Location not found");
        error.statusCode = 404;
        throw error;
    }

    return location;
};

const updateMyLocation = async (userId, body) => {
    return await upsertUserLocation({
        userId,
        latitude: body.latitude,
        longitude: body.longitude,
    });
};

module.exports = {
    completeProfile,
    getProfile,
    updateProfile,
    getUserDetails,
    getAllUsersService,
    updateRole,
    deleteUserAccount,
    getMyLocation,
    updateMyLocation,
};