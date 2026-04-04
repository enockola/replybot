import db from '../db.js';

/**
 * Get all response categories for dropdown
 */
const getAllCategories = async () => {
    const query = `
        SELECT id, name, slug, description, display_order
        FROM response_categories
        ORDER BY display_order ASC, name ASC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Create a new response suggestion
 */
const createSuggestion = async (userId, categoryId, suggestedCategoryName, responseContent) => {
    const query = `
        INSERT INTO response_suggestions (
            user_id,
            category_id,
            suggested_category_name,
            response_content,
            status
        )
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING *
    `;
    const result = await db.query(query, [
        userId,
        categoryId || null,
        suggestedCategoryName || null,
        responseContent
    ]);
    return result.rows[0];
};

/**
 * Get all suggestions for a user
 */
const getSuggestionsByUserId = async (userId) => {
    const query = `
        SELECT
            response_suggestions.*,
            response_categories.name AS "categoryName"
        FROM response_suggestions
        LEFT JOIN response_categories
            ON response_suggestions.category_id = response_categories.id
        WHERE response_suggestions.user_id = $1
        ORDER BY response_suggestions.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Get one suggestion by id
 */
const getSuggestionById = async (id) => {
    const query = `
        SELECT
            response_suggestions.*,
            response_categories.name AS "categoryName",
            users.first_name,
            users.last_name,
            users.email
        FROM response_suggestions
        LEFT JOIN response_categories
            ON response_suggestions.category_id = response_categories.id
        INNER JOIN users
            ON response_suggestions.user_id = users.id
        WHERE response_suggestions.id = $1
        LIMIT 1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Get all suggestions for admin review
 */
const getAllSuggestions = async () => {
    const query = `
        SELECT
            response_suggestions.*,
            response_categories.name AS "categoryName",
            users.first_name,
            users.last_name,
            users.email
        FROM response_suggestions
        LEFT JOIN response_categories
            ON response_suggestions.category_id = response_categories.id
        INNER JOIN users
            ON response_suggestions.user_id = users.id
        ORDER BY response_suggestions.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Delete a suggestion
 * Only really intended for pending suggestions
 */
const deleteSuggestion = async (id, userId) => {
    const query = `
        DELETE FROM response_suggestions
        WHERE id = $1 AND user_id = $2 AND status = 'pending'
    `;
    const result = await db.query(query, [id, userId]);
    return result.rowCount > 0;
};

/**
 * Create category if needed, otherwise return existing id
 */
const createCategoryIfMissing = async (categoryName) => {
    const slug = categoryName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const existingQuery = `
        SELECT id
        FROM response_categories
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
    `;
    const existing = await db.query(existingQuery, [categoryName]);

    if (existing.rows[0]) {
        return existing.rows[0].id;
    }

    const insertQuery = `
        INSERT INTO response_categories (name, slug, description, display_order)
        VALUES ($1, $2, $3, 0)
        RETURNING id
    `;
    const inserted = await db.query(insertQuery, [
        categoryName,
        slug,
        'User-suggested category approved by admin'
    ]);

    return inserted.rows[0].id;
};

/**
 * Create approved canned response
 */
const createApprovedResponse = async (categoryId, content, adminUserId) => {
    const query = `
        INSERT INTO canned_responses (category_id, content, created_by_user_id, is_active)
        VALUES ($1, $2, $3, TRUE)
        RETURNING id
    `;
    const result = await db.query(query, [categoryId, content, adminUserId]);
    return result.rows[0];
};

/**
 * Mark suggestion approved
 */
const markSuggestionApproved = async (suggestionId, approvedResponseId, adminNotes = null) => {
    const query = `
        UPDATE response_suggestions
        SET
            status = 'approved',
            approved_response_id = $1,
            admin_notes = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
    `;
    const result = await db.query(query, [approvedResponseId, adminNotes, suggestionId]);
    return result.rows[0] || null;
};

/**
 * Mark suggestion rejected
 */
const markSuggestionRejected = async (suggestionId, adminNotes = null) => {
    const query = `
        UPDATE response_suggestions
        SET
            status = 'rejected',
            admin_notes = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;
    const result = await db.query(query, [adminNotes, suggestionId]);
    return result.rows[0] || null;
};

export {
    getAllCategories,
    createSuggestion,
    getSuggestionsByUserId,
    getSuggestionById,
    getAllSuggestions,
    deleteSuggestion,
    createCategoryIfMissing,
    createApprovedResponse,
    markSuggestionApproved,
    markSuggestionRejected
};