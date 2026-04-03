import db from '../db.js';

/**
 * Checks if an email address is already registered in the database.
 *
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const emailExists = async (email) => {
    const query = `
        SELECT EXISTS(
            SELECT 1
            FROM users
            WHERE LOWER(email) = LOWER($1)
        ) AS exists
    `;
    const result = await db.query(query, [email]);
    return result.rows[0].exists;
};

/**
 * Saves a new user to the database with a hashed password.
 * Assumes the database default handles role_id if omitted.
 *
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} hashedPassword
 * @returns {Promise<Object>}
 */
const saveUser = async (firstName, lastName, email, hashedPassword, roleId) => {
    const query = `
        INSERT INTO users (first_name, last_name, email, password_hash, role_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, first_name, last_name, email, role_id, created_at
    `;
    const result = await db.query(query, [
        firstName,
        lastName,
        email,
        hashedPassword,
        roleId
    ]);
    return result.rows[0];
};

/**
 * Retrieves all registered users from the database, including role name.
 *
 * @returns {Promise<Array>}
 */
const getAllUsers = async () => {
    const query = `
        SELECT
            users.id,
            users.first_name,
            users.last_name,
            users.email,
            users.role_id,
            users.created_at,
            roles.name AS "roleName"
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        ORDER BY users.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Retrieves one user by email.
 * Useful for login.
 *
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
const getUserByEmail = async (email) => {
    const query = `
        SELECT
            users.id,
            users.first_name,
            users.last_name,
            users.email,
            users.password_hash,
            users.role_id,
            users.created_at,
            roles.name AS "roleName"
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE LOWER(users.email) = LOWER($1)
        LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Retrieve a single user by ID with role information
 *
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
const getUserById = async (id) => {
    const query = `
        SELECT 
            users.id,
            users.first_name,
            users.last_name,
            users.email,
            users.role_id,
            users.created_at,
            roles.name AS "roleName"
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Update a user's first name, last name, and email
 *
 * @param {number} id
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
const updateUser = async (id, firstName, lastName, email) => {
    const query = `
        UPDATE users 
        SET
            first_name = $1,
            last_name = $2,
            email = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, first_name, last_name, email, role_id, updated_at
    `;
    const result = await db.query(query, [firstName, lastName, email, id]);
    return result.rows[0] || null;
};

/**
 * Delete a user account
 *
 * @param {number} id
 * @returns {Promise<boolean>}
 */
const deleteUser = async (id) => {
    const query = `DELETE FROM users WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

export {
    emailExists,
    saveUser,
    getAllUsers,
    getUserByEmail,
    getUserById,
    updateUser,
    deleteUser
};