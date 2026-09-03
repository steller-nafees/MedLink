const {
  getDonors,
  getDonorDetails,
} = require("./blood.service");


const getBloodDonors = async (req, res, next) => {
  try {
    const result = await getDonors(
      req.user.id,
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Blood donors fetched successfully",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const getBloodDonorById = async (req, res, next) => {
  try {
    const donor = await getDonorDetails(
      req.params.donorId
    );

    return res.status(200).json({
      success: true,
      message: "Blood donor details fetched successfully",
      statusCode: 200,
      data: donor,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getBloodDonors,
  getBloodDonorById,
};