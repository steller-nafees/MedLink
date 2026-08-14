const bcrypt = require("bcrypt");
const crypto = require("crypto");

const {
  findUserByEmail,
  findUserByPhone,
  createUser,
  updateLastLogin,
  hasUserProfile,
  createEmergencyUser,
} = require("../models/auth.model");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");

const {
    createEmergencyProfile,
    upsertUserLocation,
} = require("../models/user.model");

const login = async ({ email, phone, password }) => {

    // Find user
    let user;

    if (email) {
        user = await findUserByEmail(email);
    } else if (phone) {
        user = await findUserByPhone(phone);
    }

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        error.errorCode = "USER_NOT_FOUND";
        throw error;
    }

    // Check account status
    if (!user.is_active) {
        const error = new Error("Account has been deactivated");
        error.statusCode = 403;
        error.errorCode = "ACCOUNT_DISABLED";
        throw error;
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordCorrect) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        error.errorCode = "INVALID_CREDENTIALS";
        throw error;
    }

    // Update login time
    const updatedLogin = await updateLastLogin(user.id);

    // Profile exists?
    const profileComplete = await hasUserProfile(user.id);

    // JWT payload
    const payload = {
        userId: user.id,
        role: user.role_type,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        user: {
            ...user,
            last_login: updatedLogin.last_login,
        },

        profileComplete,

        token: {
            accessToken,
            refreshToken,
            expiresIn: 3600,
            tokenType: "Bearer",
        },
    };
};

const signup = async ({ email, phone, password, userType }) => {
  // Check if email already exists
  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    const error = new Error("User already registered with this email");
    error.statusCode = 409;
    error.errorCode = "EMAIL_EXISTS";
    throw error;
  }

  // Check if phone already exists
  const existingPhone = await findUserByPhone(phone);

  if (existingPhone) {
    const error = new Error("User already registered with this phone number");
    error.statusCode = 409;
    error.errorCode = "PHONE_EXISTS";
    throw error;
  }

  // Hash password
    // I could use one improvement here 
    // const BCRYPT_SALT_ROUNDS = 12;
    // const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    // const passwordHash = await bcrypt.hash(password, saltRounds);

  const passwordHash = await bcrypt.hash(password, 12);




  // Create user
  const user = await createUser({
    roleType: userType,
    email,
    phone,
    passwordHash,
  });

  // JWT payload
  const payload = {
    userId: user.id,
    role: user.role_type,
  };

  // Generate tokens
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user,
    token: {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: "Bearer",
    },
  };
};


// I will use it for my emergency login feature

// const startEmergencySession = async ({
//     name,
//     phone,
//     latitude,
//     longitude,
// }) => {

//     const payload = {
//         sessionType: "EMERGENCY",

//         name,
//         phone,

//         latitude,
//         longitude,
//     };

//     // 1. Create user

//     // 2. get user id

//     // 3. Generate access token

//     // 4. async Store user location

//     //  5. return response
//     // {
//     //   data: {
//     //      name,
//     //     phone,
//     //     latitude,
//     //     longitude,

//     //     isEmergency: true,

//     //     token: {
//     //         accessToken,
//     //         expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS) || 3600,
//     //         tokenType: "Bearer",
//     //     },
//     //  controller: message: "Emergency session started. Use your phone number as passsword to login later",
//     // }


//     const accessToken = generateAccessToken(payload);

//     return {
//         name,
//         phone,
//         latitude,
//         longitude,

//         isEmergency: true,

//         token: {
//             accessToken,
//             expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS) || 3600,
//             tokenType: "Bearer",
//         },
//     };
// };

const startEmergencySession = async ({
    name,
    phone,
    latitude,
    longitude,
}) => {

    // 1. Check whether this phone already belongs to a user
    let user = await findUserByPhone(phone);

    let temporaryPassword = null;
    let isNewEmergencyUser = false;

    // 2. Existing user → reuse existing account
    if (user) {

        if (!user.is_active) {
            const error = new Error("Account has been deactivated");
            error.statusCode = 403;
            error.errorCode = "ACCOUNT_DISABLED";
            throw error;
        }

    }

    // 3. New emergency user → create CUSTOMER account
    else {

        // Generate temporary password
        temporaryPassword = `SOS-${crypto.randomBytes(6).toString("hex")}`;

        // Hash temporary password
        const passwordHash = await bcrypt.hash(
            temporaryPassword,
            12
        );

        user = await createEmergencyUser({
            phone,
            passwordHash,
        });

        isNewEmergencyUser = true;

        // Store emergency user's name
        await createEmergencyProfile({
            userId: user.id,
            name,
        });
    }

    // 4. Store/update user's current location
    const location = await upsertUserLocation({
        userId: user.id,
        latitude,
        longitude,
    });

    // 5. Update last login
    const updatedLogin = await updateLastLogin(user.id);

    // 6. Generate emergency access token
    const payload = {
        userId: user.id,
        role: user.role_type,
        sessionType: "EMERGENCY",
        isEmergency: true,
    };

    const accessToken = generateAccessToken(payload);

    // 7. Return emergency session
    return {
        user: {
            id: user.id,
            phone: user.phone,
            roleType: user.role_type,
            lastLogin: updatedLogin.last_login,
        },

        name,

        location: {
            latitude: location.latitude,
            longitude: location.longitude,
        },

        isEmergency: true,

        isNewEmergencyUser,

        temporaryPassword,

        token: {
            accessToken,
            expiresIn:
                Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS) || 3600,
            tokenType: "Bearer",
        },
    };
};

const logout = async () => {
    return true;
};

module.exports = {
  signup,
  login,
  startEmergencySession,
  logout,
};