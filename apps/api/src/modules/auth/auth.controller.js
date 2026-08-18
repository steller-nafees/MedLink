const authService = require("./auth.service");

const signup = async (req, res) => {
  try {
    const result = await authService.signup(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      statusCode: 201,
      data: {
        userId: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        userType: result.user.role_type,
        createdAt: result.user.created_at,
      },
      token: result.token,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      statusCode: error.statusCode || 500,
      ...(error.errorCode && {
        errorCode: error.errorCode,
      }),
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      statusCode: 200,

      data: {
        userId: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        userType: result.user.role_type,

        profileComplete: result.profileComplete,

        lastLogin: result.user.last_login,
      },

      token: result.token,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      statusCode: error.statusCode || 500,

      ...(error.errorCode && {
        errorCode: error.errorCode,
      }),
    });
  }
};

const logout = async (req, res) => {
  await authService.logout();

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
    statusCode: 200,
  });
};

const startEmergencySession = async (req, res) => {
  try {
    const result = await authService.startEmergencySession(req.body);

    return res.status(200).json({
      success: true,
      message: "Emergency session started",
      statusCode: 200,
      data: {
        userId: result.user.id,
        name: result.name,
        phone: result.user.phone,
        roleType: result.user.roleType,
        latitude: result.location.latitude,
        longitude: result.location.longitude,
        isEmergency: result.isEmergency,
        isNewEmergencyUser: result.isNewEmergencyUser,
        temporaryPassword: result.temporaryPassword,
      },
      token: result.token,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      statusCode: error.statusCode || 500,
      ...(error.errorCode && {
        errorCode: error.errorCode,
      }),
    });
  }
};

module.exports = {
  signup,
  login,
  startEmergencySession,
  logout,
};
