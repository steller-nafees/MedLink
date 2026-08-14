const pool = require("../../infrastructure/database/postgres");

const findUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;

  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

const findUserByPhone = async (phone) => {
  const query = `
    SELECT *
    FROM users
    WHERE phone = $1
    LIMIT 1;
  `;

  const { rows } = await pool.query(query, [phone]);
  return rows[0];
};

const createUser = async ({
  roleType,
  email,
  phone,
  passwordHash,
}) => {
  const query = `
    INSERT INTO users (
      role_type,
      email,
      phone,
      password_hash
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      role_type,
      email,
      phone,
      created_at;
  `;

  const values = [
    roleType,
    email,
    phone,
    passwordHash,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
};

const updateLastLogin = async (userId) => {
  const query = `
    UPDATE users
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING last_login;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};

const hasUserProfile = async (userId) => {
  const query = `
    SELECT 1
    FROM user_profiles
    WHERE user_id = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [userId]);

  return result.rowCount > 0;
};

const createEmergencyUser = async ({
  phone,
  passwordHash,
}) => {
  const query = `
    INSERT INTO users
    (
      role_type,
      email,
      phone,
      password_hash
    )
    VALUES
    (
      'CUSTOMER',
      NULL,
      $1,
      $2
    )
    RETURNING
      id,
      role_type,
      email,
      phone,
      is_verified,
      is_active,
      created_at;
  `;

  const result = await pool.query(query, [
    phone,
    passwordHash,
  ]);

  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  findUserByPhone,
  createUser,
  updateLastLogin,
  hasUserProfile,
  createEmergencyUser,
};