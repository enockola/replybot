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
            WHERE email = $1
        ) AS exists
    `;
    const result = await db.query(query, [email]);
    return result.rows[0].exists;
};

/**
 * Saves a new user to the database with a hashed password.
 *
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} hashedPassword
 * @param {number} roleId
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
 * Retrieves all registered users from the database.
 *
 * @returns {Promise<Array>}
 */
const getAllUsers = async () => {
    const query = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            role_id,
            created_at
        FROM users
        ORDER BY created_at DESC
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
            id,
            first_name,
            last_name,
            email,
            password_hash,
            role_id,
            created_at
        FROM users
        WHERE email = $1
        LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
};

export { emailExists, saveUser, getAllUsers, getUserByEmail };