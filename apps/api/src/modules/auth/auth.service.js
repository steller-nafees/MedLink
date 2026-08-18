const bcrypt = require("bcrypt");

const {
  findUserByEmail,
  findUserByPhone,
  createUser,
  updateLastLogin,
  hasUserProfile,
} = require("./auth.repository");
const { createUserProfile } = require("../user/user.repository");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../shared/utils/jwt");

const login = async ({ email, phone, password }) => {
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

  if (!user.is_active) {
    const error = new Error("Account has been deactivated");
    error.statusCode = 403;
    error.errorCode = "ACCOUNT_DISABLED";
    throw error;
  }

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

  const updatedLogin = await updateLastLogin(user.id);

  const profileComplete = await hasUserProfile(user.id);

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

const signup = async ({
  email,
  phone,
  password,
  userType,
  firstName,
  lastName,
  gender,
  dateOfBirth,
  nationalId,
  address,
  emergencyContactName,
  emergencyContactPhone,
  bloodGroup,
}) => {
  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    const error = new Error("User already registered with this email");
    error.statusCode = 409;
    error.errorCode = "EMAIL_EXISTS";
    throw error;
  }

  const existingPhone = await findUserByPhone(phone);

  if (existingPhone) {
    const error = new Error("User already registered with this phone number");
    error.statusCode = 409;
    error.errorCode = "PHONE_EXISTS";
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser({
    roleType: userType,
    email,
    phone,
    passwordHash,
  });

  await createUserProfile({
    userId: user.id,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    nationalId,
    address,
    emergencyContactName,
    emergencyContactPhone,
    bloodGroup,
  });

  const payload = {
    userId: user.id,
    role: user.role_type,
  };

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

module.exports = {
  signup,
  login,
};