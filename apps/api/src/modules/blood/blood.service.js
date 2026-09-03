const {
  findDonors,
  findDonorById,
  getUserLocation,
} = require("./blood.repository");


const getDonors = async (userId, queryData) => {
  const {
    bloodGroup,
    limit,
    offset,
    radius,
  } = queryData;

  let requesterLatitude = null;
  let requesterLongitude = null;

  if (radius !== undefined) {
    const userLocation = await getUserLocation(userId);

    if (!userLocation) {
      const error = new Error(
        "Your location is required to search donors within a radius"
      );

      error.statusCode = 400;
      throw error;
    }

    requesterLatitude = Number(userLocation.latitude);
    requesterLongitude = Number(userLocation.longitude);
  }

  const result = await findDonors({
    bloodGroup,
    limit,
    offset,
    radius,
    requesterLatitude,
    requesterLongitude,
  });

  return {
    donors: result.donors,
    pagination: {
      total: result.total,
      limit,
      offset,
    },
  };
};


const getDonorDetails = async (donorId) => {
  const donor = await findDonorById(donorId);

  if (!donor) {
    const error = new Error("Blood donor not found");

    error.statusCode = 404;
    throw error;
  }

  return donor;
};


module.exports = {
  getDonors,
  getDonorDetails,
};