const pool = require("../../infrastructure/database/postgres");

const findDonors = async ({
  bloodGroup,
  limit,
  offset,
  radius,
  requesterLatitude,
  requesterLongitude,
}) => {
  const values = [];
  const conditions = [
    "u.role_type = 'CUSTOMER'",
    "u.is_active = true",
    "bi.can_donate = true",
    "bi.is_available_for_donation = true",
  ];

  if (bloodGroup) {
    values.push(bloodGroup);
    conditions.push(`bi.blood_group = $${values.length}`);
  }

  let distanceSelect = "";
  let distanceCondition = "";
  let orderBy = "ORDER BY up.first_name ASC NULLS LAST, up.last_name ASC NULLS LAST";

  const shouldCalculateDistance =
    radius !== undefined &&
    requesterLatitude !== null &&
    requesterLongitude !== null;

  if (shouldCalculateDistance) {
    values.push(requesterLatitude);
    const latitudeIndex = values.length;

    values.push(requesterLongitude);
    const longitudeIndex = values.length;

    distanceSelect = `
      ,
      (
        6371 * acos(
          LEAST(
            1,
            cos(radians($${latitudeIndex}))
            * cos(radians(ul.latitude))
            * cos(radians(ul.longitude) - radians($${longitudeIndex}))
            + sin(radians($${latitudeIndex}))
            * sin(radians(ul.latitude))
          )
        )
      ) AS distance_km
    `;

    values.push(radius);
    const radiusIndex = values.length;

    distanceCondition = `
      AND (
        6371 * acos(
          LEAST(
            1,
            cos(radians($${latitudeIndex}))
            * cos(radians(ul.latitude))
            * cos(radians(ul.longitude) - radians($${longitudeIndex}))
            + sin(radians($${latitudeIndex}))
            * sin(radians(ul.latitude))
          )
        )
      ) <= $${radiusIndex}
    `;

    orderBy = "ORDER BY distance_km ASC";
  }

  const whereClause = conditions.join("\nAND ");

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM users u
    INNER JOIN blood_information bi
      ON bi.user_id = u.id
    LEFT JOIN user_profiles up
      ON up.user_id = u.id
    ${shouldCalculateDistance ? "INNER JOIN user_locations ul ON ul.user_id = u.id" : ""}
    WHERE ${whereClause}
    ${distanceCondition}
  `;

  const countResult = await pool.query(
    countQuery,
    shouldCalculateDistance
      ? values.slice(0, values.length - 1)
      : values
  );

  const total = Number(countResult.rows[0].total);

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const query = `
    SELECT
      u.id AS donor_id,
      u.phone,
      up.first_name,
      up.last_name,
      up.gender,
      up.address,
      bi.blood_group,
      bi.last_donation_date,
      bi.can_donate,
      bi.next_available_date
      ${distanceSelect}

    FROM users u

    INNER JOIN blood_information bi
      ON bi.user_id = u.id

    LEFT JOIN user_profiles up
      ON up.user_id = u.id

    ${shouldCalculateDistance ? "INNER JOIN user_locations ul ON ul.user_id = u.id" : ""}

    WHERE ${whereClause}
    ${distanceCondition}

    ${orderBy}

    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `;

  const result = await pool.query(query, values);

  return {
    donors: result.rows,
    total,
  };
};


const findDonorById = async (donorId) => {
  const query = `
    SELECT
      u.id AS donor_id,
      u.phone,
      up.first_name,
      up.last_name,
      up.gender,
      up.address,
      bi.blood_group,
      bi.last_donation_date,
      bi.can_donate,
      bi.next_available_date,
      bi.is_available_for_donation

    FROM users u

    INNER JOIN blood_information bi
      ON bi.user_id = u.id

    LEFT JOIN user_profiles up
      ON up.user_id = u.id

    WHERE u.id = $1
      AND u.role_type = 'CUSTOMER'
      AND u.is_active = true
      AND bi.can_donate = true
      AND bi.is_available_for_donation = true
  `;

  const result = await pool.query(query, [donorId]);

  return result.rows[0] || null;
};


const getUserLocation = async (userId) => {
  const query = `
    SELECT
      latitude,
      longitude
    FROM user_locations
    WHERE user_id = $1
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0] || null;
};


module.exports = {
  findDonors,
  findDonorById,
  getUserLocation,
};