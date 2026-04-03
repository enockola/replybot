import db from '../db.js';

/**
 * Create a new ticket
 */
const createTicket = async (userId, subject, message) => {
    const query = `
        INSERT INTO tickets (user_id, subject, message, status)
        VALUES ($1, $2, $3, 'received')
        RETURNING *
    `;
    const result = await db.query(query, [userId, subject, message]);
    return result.rows[0];
};

/**
 * Get all tickets created by one user
 */
const getTicketsByUserId = async (userId) => {
    const query = `
        SELECT
            tickets.id,
            tickets.subject,
            tickets.message,
            tickets.status,
            tickets.assigned_vendor_id,
            tickets.created_at,
            tickets.updated_at
        FROM tickets
        WHERE tickets.user_id = $1
        ORDER BY tickets.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Get all tickets (admin/vendor view)
 */
const getAllTickets = async () => {
    const query = `
        SELECT
            tickets.id,
            tickets.user_id,
            tickets.assigned_vendor_id,
            tickets.subject,
            tickets.message,
            tickets.status,
            tickets.created_at,
            tickets.updated_at,
            users.first_name,
            users.last_name,
            users.email
        FROM tickets
        INNER JOIN users ON tickets.user_id = users.id
        ORDER BY tickets.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Get one ticket by ID
 */
const getTicketById = async (ticketId) => {
    const query = `
        SELECT
            tickets.*,
            users.first_name,
            users.last_name,
            users.email,
            roles.name AS "roleName"
        FROM tickets
        INNER JOIN users ON tickets.user_id = users.id
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE tickets.id = $1
        LIMIT 1
    `;
    const result = await db.query(query, [ticketId]);
    return result.rows[0] || null;
};

/**
 * Add a message to a ticket
 */
const addTicketMessage = async (ticketId, userId, message) => {
    const query = `
        INSERT INTO ticket_messages (ticket_id, user_id, message)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const result = await db.query(query, [ticketId, userId, message]);
    return result.rows[0];
};

/**
 * Get all messages for a ticket
 */
const getTicketMessages = async (ticketId) => {
    const query = `
        SELECT
            ticket_messages.id,
            ticket_messages.ticket_id,
            ticket_messages.user_id,
            ticket_messages.message,
            ticket_messages.created_at,
            users.first_name,
            users.last_name,
            users.email,
            roles.name AS "roleName"
        FROM ticket_messages
        LEFT JOIN users ON ticket_messages.user_id = users.id
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE ticket_messages.ticket_id = $1
        ORDER BY ticket_messages.created_at ASC
    `;
    const result = await db.query(query, [ticketId]);
    return result.rows;
};

/**
 * Update ticket status
 */
const updateTicketStatus = async (ticketId, newStatus) => {
    const query = `
        UPDATE tickets
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;
    const result = await db.query(query, [newStatus, ticketId]);
    return result.rows[0] || null;
};

/**
 * Add ticket status history
 */
const addTicketStatusHistory = async (ticketId, oldStatus, newStatus, changedByUserId) => {
    const query = `
        INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by_user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const result = await db.query(query, [ticketId, oldStatus, newStatus, changedByUserId]);
    return result.rows[0];
};

/**
 * Get ticket status history
 */
const getTicketStatusHistory = async (ticketId) => {
    const query = `
        SELECT
            ticket_status_history.id,
            ticket_status_history.old_status,
            ticket_status_history.new_status,
            ticket_status_history.changed_at,
            users.first_name,
            users.last_name,
            roles.name AS "roleName"
        FROM ticket_status_history
        LEFT JOIN users ON ticket_status_history.changed_by_user_id = users.id
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE ticket_status_history.ticket_id = $1
        ORDER BY ticket_status_history.changed_at ASC
    `;
    const result = await db.query(query, [ticketId]);
    return result.rows;
};

/**
 * Assign ticket to vendor/admin
 */
const assignTicket = async (ticketId, assignedVendorId) => {
    const query = `
        UPDATE tickets
        SET assigned_vendor_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;
    const result = await db.query(query, [assignedVendorId, ticketId]);
    return result.rows[0] || null;
};

export {
    createTicket,
    getTicketsByUserId,
    getAllTickets,
    getTicketById,
    addTicketMessage,
    getTicketMessages,
    updateTicketStatus,
    addTicketStatusHistory,
    getTicketStatusHistory,
    assignTicket
};