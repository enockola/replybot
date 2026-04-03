import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
    createTicket,
    getTicketsByUserId,
    getAllTickets,
    getTicketById,
    addTicketMessage,
    getTicketMessages,
    updateTicketStatus,
    addTicketStatusHistory,
    getTicketStatusHistory
} from '../../models/tickets/ticket.js';
import { requireLogin } from '../../middleware/auth.js';

const router = Router();

const ticketValidation = [
    body('subject')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Subject must be between 3 and 200 characters'),

    body('message')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Message must be at least 10 characters')
];

const messageValidation = [
    body('message')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Message cannot be empty')
];

const showTicketPortal = (req, res) => {
    res.render('tickets/portal', {
        title: 'Tickets',
        currentUser: req.session.user
    });
};

/**
 * Show new ticket form
 */
const showNewTicketForm = (req, res) => {
    let formData = {};

    const flashedFormData = req.flash('formData');
    if (flashedFormData.length > 0) {
        try {
            formData = JSON.parse(flashedFormData[0]);
        } catch {
            formData = {};
        }
    }

    res.render('tickets/new', {
        title: 'Create Ticket',
        formData
    });
};

/**
 * Create ticket
 */
const handleCreateTicket = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        req.flash('formData', JSON.stringify(req.body));
        return res.redirect('/tickets/new');
    }

    const { subject, message } = req.body;
    const userId = req.session.user.id;

    try {
        const ticket = await createTicket(userId, subject, message);
        req.flash('success', 'Ticket created successfully.');
        return res.redirect(`/tickets/${ticket.id}`);
    } catch (error) {
        console.error('Error creating ticket:', error);
        req.flash('error', 'Unable to create ticket.');
        req.flash('formData', JSON.stringify(req.body));
        return res.redirect('/tickets/new');
    }
};

/**
 * Show logged-in user's tickets
 */
const showMyTickets = async (req, res) => {
    try {
        const tickets = await getTicketsByUserId(req.session.user.id);

        res.render('tickets/list', {
            title: 'My Tickets',
            tickets
        });
    } catch (error) {
        console.error('Error loading tickets:', error);
        req.flash('error', 'Unable to load your tickets.');
        return res.redirect('/dashboard');
    }
};

/**
 * Show all tickets for admin/vendor
 */
const showAllSupportTickets = async (req, res) => {
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin' && currentUser.roleName !== 'vendor') {
        req.flash('error', 'You do not have permission to view support tickets.');
        return res.redirect('/dashboard');
    }

    try {
        const tickets = await getAllTickets();

        res.render('tickets/admin-list', {
            title: 'Support Dashboard',
            tickets,
            user: currentUser
        });
    } catch (error) {
        console.error('Error loading all tickets:', error);
        req.flash('error', 'Unable to load tickets.');
        return res.redirect('/dashboard');
    }
};

/**
 * Show one ticket
 */
const showTicketDetail = async (req, res) => {
    const ticketId = parseInt(req.params.id, 10);

    if (Number.isNaN(ticketId)) {
        req.flash('error', 'Invalid ticket ID.');
        return res.redirect('/tickets/my-tickets');
    }

    const currentUser = req.session.user;

    try {
        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            req.flash('error', 'Ticket not found.');
            return res.redirect('/tickets/my-tickets');
        }

        const isOwner = currentUser.id === ticket.user_id;
        const isStaff = currentUser.roleName === 'admin' || currentUser.roleName === 'vendor';

        if (!isOwner && !isStaff) {
            req.flash('error', 'You do not have permission to view this ticket.');
            return res.redirect('/tickets/my-tickets');
        }

        const messages = await getTicketMessages(ticketId);
        const history = await getTicketStatusHistory(ticketId);

        res.render('tickets/detail', {
            title: `Ticket #${ticket.id}`,
            ticket,
            messages,
            history,
            currentUser
        });
    } catch (error) {
        console.error('Error loading ticket:', error);
        req.flash('error', 'Unable to load ticket.');
        return res.redirect('/tickets/my-tickets');
    }
};

/**
 * Add a ticket reply
 */
const processTicketReply = async (req, res) => {
    const ticketId = parseInt(req.params.id, 10);
    const currentUser = req.session.user;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect(`/tickets/${ticketId}`);
    }

    try {
        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            req.flash('error', 'Ticket not found.');
            return res.redirect('/my-tickets');
        }

        const isOwner = ticket.user_id === currentUser.id;
        const isStaff = currentUser.roleName === 'admin' || currentUser.roleName === 'vendor';

        if (!isOwner && !isStaff) {
            req.flash('error', 'You do not have permission to reply to this ticket.');
            return res.redirect('/my-tickets');
        }

        await addTicketMessage(ticketId, currentUser.id, req.body.message);
        req.flash('success', 'Reply added successfully.');
        return res.redirect(`/tickets/${ticketId}`);
    } catch (error) {
        console.error('Error adding ticket reply:', error);
        req.flash('error', 'Unable to add reply.');
        return res.redirect(`/tickets/${ticketId}`);
    }
};

/**
 * Update ticket status
 */
const processTicketStatusUpdate = async (req, res) => {
    const ticketId = parseInt(req.params.id, 10);
    const currentUser = req.session.user;
    const { status } = req.body;

    const allowedStatuses = ['received', 'assigned', 'in_progress', 'resolved', 'closed'];

    if (!allowedStatuses.includes(status)) {
        req.flash('error', 'Invalid ticket status.');
        return res.redirect(`/tickets/${ticketId}`);
    }

    if (currentUser.roleName !== 'admin' && currentUser.roleName !== 'vendor') {
        req.flash('error', 'You do not have permission to change ticket status.');
        return res.redirect(`/tickets/${ticketId}`);
    }

    try {
        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            req.flash('error', 'Ticket not found.');
            return res.redirect('/tickets/support');
        }

        const oldStatus = ticket.status;

        await updateTicketStatus(ticketId, status);
        await addTicketStatusHistory(ticketId, oldStatus, status, currentUser.id);

        req.flash('success', 'Ticket status updated.');
        return res.redirect(`/tickets/${ticketId}`);
    } catch (error) {
        console.error('Error updating ticket status:', error);
        req.flash('error', 'Unable to update ticket status.');
        return res.redirect(`/tickets/${ticketId}`);
    }
};

router.get('/', requireLogin, showTicketPortal);
router.get('/new', requireLogin, showNewTicketForm);
router.post('/', requireLogin, ticketValidation, handleCreateTicket);
router.get('/my-tickets', requireLogin, showMyTickets);
router.get('/support', requireLogin, showAllSupportTickets);

router.get('/:id', requireLogin, showTicketDetail);
router.post('/:id/messages', requireLogin, messageValidation, processTicketReply);
router.post('/:id/status', requireLogin, processTicketStatusUpdate);

export default router;