const bcrypt = require("bcrypt");
const adminRepository = require("./admin.repository");
const pool = require("../../infrastructure/database/postgres");

// ============================================================
// GET ALL USERS
// ============================================================

const getAllUsers = async ({
    limit,
    offset,
    userType,
    status,
}) => {
    const users = await adminRepository.getAllUsers({
        limit,
        offset,
        userType,
        status,
    });

    const total = await adminRepository.countUsers({
        userType,
        status,
    });

    return {
        users,
        total,
    };
};

// ============================================================
// UPDATE USER ROLE
// ============================================================

const updateUserRole = async (
    userId,
    newRole,
    adminUserId
) => {
    const user = await adminRepository.getUserById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Prevent a Super Admin from changing their own role
    if (userId === adminUserId) {
        const error = new Error(
            "You cannot change your own role"
        );
        error.statusCode = 400;
        throw error;
    }

    return await adminRepository.updateUserRole(
        userId,
        newRole
    );
};

// ============================================================
// UPDATE USER STATUS
// ============================================================

const updateUserStatus = async (
    userId,
    status,
    adminUserId
) => {
    const user = await adminRepository.getUserById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Prevent a Super Admin from disabling themselves
    if (userId === adminUserId) {
        const error = new Error(
            "You cannot change your own account status"
        );
        error.statusCode = 400;
        throw error;
    }

    const isActive = status === "active";

    return await adminRepository.updateUserStatus(
        userId,
        isActive
    );
};

// ============================================================
// GET ALL HOSPITALS
// ============================================================

const getAllHospitals = async ({
    limit,
    offset,
    status,
}) => {
    const hospitals =
        await adminRepository.getAllHospitals({
            limit,
            offset,
            status,
        });

    const total =
        await adminRepository.countHospitals({
            status,
        });

    return {
        hospitals,
        total,
    };
};

// ============================================================
// GET HOSPITAL DETAILS
// ============================================================

const getHospitalById = async (hospitalId) => {
    const hospital =
        await adminRepository.getHospitalById(hospitalId);

    if (!hospital) {
        const error = new Error("Hospital not found");
        error.statusCode = 404;
        throw error;
    }

    return hospital;
};

// ============================================================
// CREATE HOSPITAL
// ============================================================

const createHospital = async ({
    hospital,
    admin,
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Create hospital
        const createdHospital =
            await adminRepository.createHospital(
                client,
                hospital
            );

        // 2. Hash admin password
        const passwordHash = await bcrypt.hash(
            admin.password,
            10
        );

        // 3. Create hospital admin user
        const createdAdmin =
            await adminRepository.createHospitalAdminUser(
                client,
                {
                    email: admin.email,
                    phone: admin.phone,
                    passwordHash,
                }
            );

        // 4. Assign admin to hospital
        const assignment =
            await adminRepository.assignHospitalAdmin(
                client,
                createdHospital.id,
                createdAdmin.id
            );

        await client.query("COMMIT");

        return {
            hospital: createdHospital,
            admin: createdAdmin,
            assignment,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// ============================================================
// UPDATE HOSPITAL
// ============================================================

const updateHospital = async (
    hospitalId,
    updateData
) => {
    const existingHospital =
        await adminRepository.getHospitalById(hospitalId);

    if (!existingHospital) {
        const error = new Error("Hospital not found");
        error.statusCode = 404;
        throw error;
    }

    const updatedHospital =
        await adminRepository.updateHospital(
            hospitalId,
            updateData
        );

    return updatedHospital;
};

// ============================================================
// DELETE HOSPITAL
// ============================================================

const deleteHospital = async (hospitalId) => {
    const existingHospital =
        await adminRepository.getHospitalById(hospitalId);

    if (!existingHospital) {
        const error = new Error("Hospital not found");
        error.statusCode = 404;
        throw error;
    }

    return await adminRepository.deleteHospital(
        hospitalId
    );
};

// ============================================================
// GET ALL AMBULANCE PROVIDERS
// ============================================================

const getAllAmbulanceProviders = async ({
    limit = 50,
    offset = 0,
    status,
}) => {
    const parsedLimit = Math.min(
        Math.max(Number(limit) || 50, 1),
        100
    );

    const parsedOffset = Math.max(
        Number(offset) || 0,
        0
    );

    let isActive;

    if (status !== undefined) {
        const normalizedStatus =
            String(status).toLowerCase();

        if (normalizedStatus === "active") {
            isActive = true;
        } else if (normalizedStatus === "inactive") {
            isActive = false;
        } else {
            const error = new Error(
                "Status must be either active or inactive"
            );

            error.statusCode = 400;
            throw error;
        }
    }

    const providers =
        await adminRepository.getAllAmbulanceProviders({
            limit: parsedLimit,
            offset: parsedOffset,
            status: isActive,
        });

    const total =
        providers.length > 0
            ? Number(providers[0].total_count)
            : 0;

    const data = providers.map(
        ({ total_count, ...provider }) => provider
    );

    return {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        providers: data,
    };
};

// ============================================================
// GET AMBULANCE PROVIDER DETAILS
// ============================================================

const getAmbulanceProviderById = async (
    ambulanceProviderId
) => {
    const provider =
        await adminRepository.getAmbulanceProviderById(
            ambulanceProviderId
        );

    if (!provider) {
        const error = new Error(
            "Ambulance provider not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return provider;
};

// ============================================================
// CREATE AMBULANCE PROVIDER
// ============================================================

const createAmbulanceProvider = async ({
    providerName,
    providerPhone,
    address,
    latitude,
    longitude,
    isActive = true,

    adminEmail,
    adminPhone,
    password,
}) => {
    const passwordHash = await bcrypt.hash(
        password,
        12
    );

    return await adminRepository
        .createAmbulanceProviderWithAdmin({
            providerName,
            providerPhone,
            address,
            latitude,
            longitude,
            isActive,
            adminEmail,
            adminPhone,
            passwordHash,
        });
};

// ============================================================
// UPDATE AMBULANCE PROVIDER
// ============================================================

const updateAmbulanceProvider = async (
    ambulanceProviderId,
    updateData
) => {
    const existingProvider =
        await adminRepository.getAmbulanceProviderById(
            ambulanceProviderId
        );

    if (!existingProvider) {
        const error = new Error(
            "Ambulance provider not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return await adminRepository.updateAmbulanceProvider(
        ambulanceProviderId,
        updateData
    );
};

// ============================================================
// DELETE AMBULANCE PROVIDER
// ============================================================

const deleteAmbulanceProvider = async (
    ambulanceProviderId
) => {
    const deletedProvider =
        await adminRepository.deleteAmbulanceProvider(
            ambulanceProviderId
        );

    if (!deletedProvider) {
        const error = new Error(
            "Ambulance provider not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return deletedProvider;
};

// ============================================================
// GET ADMIN DASHBOARD
// ============================================================

const getAdminDashboard = async () => {
    return await adminRepository.getDashboardStats();
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
