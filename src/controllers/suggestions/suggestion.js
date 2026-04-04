import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
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
} from '../../models/suggestions/suggestion.js';
import { requireLogin } from '../../middleware/auth.js';

const router = Router();

const suggestionValidation = [
    body('responseContent')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Suggested response must be at least 10 characters'),

    body('categoryId')
        .optional({ checkFalsy: true })
        .isInt()
        .withMessage('Invalid category selected'),

    body('suggestedCategoryName')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Suggested category name must be between 2 and 100 characters')
];

/**
 * Portal page
 */
const showSuggestionPortal = (req, res) => {
    res.render('suggestions/portal', {
        title: 'Response Suggestions'
    });
};

/**
 * New suggestion form
 */
const showNewSuggestionForm = async (req, res) => {
    let formData = {};
    const flashedFormData = req.flash('formData');

    if (flashedFormData.length > 0) {
        try {
            formData = JSON.parse(flashedFormData[0]);
        } catch {
            formData = {};
        }
    }

    try {
        const categories = await getAllCategories();

        res.render('suggestions/new', {
            title: 'Submit Response Suggestion',
            categories,
            formData
        });
    } catch (error) {
        console.error('Error loading suggestion form:', error);
        req.flash('error', 'Unable to load suggestion form.');
        return res.redirect('/dashboard');
    }
};

/**
 * Create suggestion
 */
const handleCreateSuggestion = async (req, res) => {
    const errors = validationResult(req);

    const { categoryId, suggestedCategoryName, responseContent } = req.body;

    if (!categoryId && !suggestedCategoryName) {
        req.flash('error', 'Select an existing category or suggest a new one.');
        req.flash('formData', JSON.stringify(req.body));
        return res.redirect('/suggestions/new');
    }

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        req.flash('formData', JSON.stringify(req.body));
        return res.redirect('/suggestions/new');
    }

    try {
        await createSuggestion(
            req.session.user.id,
            categoryId || null,
            suggestedCategoryName || null,
            responseContent
        );

        req.flash('success', 'Suggestion submitted successfully.');
        return res.redirect('/suggestions/my-suggestions');
    } catch (error) {
        console.error('Error creating suggestion:', error);
        req.flash('error', 'Unable to submit suggestion.');
        req.flash('formData', JSON.stringify(req.body));
        return res.redirect('/suggestions/new');
    }
};

/**
 * User suggestions list
 */
const showMySuggestions = async (req, res) => {
    try {
        const suggestions = await getSuggestionsByUserId(req.session.user.id);

        res.render('suggestions/list', {
            title: 'My Suggestions',
            suggestions,
            isAdminView: false
        });
    } catch (error) {
        console.error('Error loading user suggestions:', error);
        req.flash('error', 'Unable to load your suggestions.');
        return res.redirect('/dashboard');
    }
};

/**
 * Admin review list
 */
const showSuggestionReview = async (req, res) => {
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to review suggestions.');
        return res.redirect('/dashboard');
    }

    try {
        const suggestions = await getAllSuggestions();

        res.render('suggestions/list', {
            title: 'Suggestion Review',
            suggestions,
            isAdminView: true
        });
    } catch (error) {
        console.error('Error loading suggestion review:', error);
        req.flash('error', 'Unable to load suggestions.');
        return res.redirect('/dashboard');
    }
};

/**
 * Suggestion detail
 */
const showSuggestionDetail = async (req, res) => {
    const suggestionId = parseInt(req.params.id, 10);

    if (Number.isNaN(suggestionId)) {
        req.flash('error', 'Invalid suggestion ID.');
        return res.redirect('/suggestions');
    }

    try {
        const suggestion = await getSuggestionById(suggestionId);

        if (!suggestion) {
            req.flash('error', 'Suggestion not found.');
            return res.redirect('/suggestions');
        }

        const currentUser = req.session.user;
        const isOwner = currentUser.id === suggestion.user_id;
        const isAdmin = currentUser.roleName === 'admin';

        if (!isOwner && !isAdmin) {
            req.flash('error', 'You do not have permission to view this suggestion.');
            return res.redirect('/suggestions');
        }

        res.render('suggestions/detail', {
            title: `Suggestion #${suggestion.id}`,
            suggestion
        });
    } catch (error) {
        console.error('Error loading suggestion detail:', error);
        req.flash('error', 'Unable to load suggestion.');
        return res.redirect('/suggestions');
    }
};

/**
 * Delete pending suggestion
 */
const processDeleteSuggestion = async (req, res) => {
    const suggestionId = parseInt(req.params.id, 10);

    try {
        const deleted = await deleteSuggestion(suggestionId, req.session.user.id);

        if (deleted) {
            req.flash('success', 'Suggestion deleted.');
        } else {
            req.flash('error', 'Suggestion could not be deleted.');
        }

        return res.redirect('/suggestions/my-suggestions');
    } catch (error) {
        console.error('Error deleting suggestion:', error);
        req.flash('error', 'Unable to delete suggestion.');
        return res.redirect('/suggestions/my-suggestions');
    }
};

/**
 * Approve suggestion
 */
const processApproveSuggestion = async (req, res) => {
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to approve suggestions.');
        return res.redirect('/dashboard');
    }

    const suggestionId = parseInt(req.params.id, 10);
    const { adminNotes } = req.body;

    try {
        const suggestion = await getSuggestionById(suggestionId);

        if (!suggestion) {
            req.flash('error', 'Suggestion not found.');
            return res.redirect('/suggestions/review');
        }

        let finalCategoryId = suggestion.category_id;

        if (!finalCategoryId && suggestion.suggested_category_name) {
            finalCategoryId = await createCategoryIfMissing(suggestion.suggested_category_name);
        }

        const approvedResponse = await createApprovedResponse(
            finalCategoryId,
            suggestion.response_content,
            currentUser.id
        );

        await markSuggestionApproved(
            suggestionId,
            approvedResponse.id,
            adminNotes || null
        );

        req.flash('success', 'Suggestion approved and added to canned responses.');
        return res.redirect('/suggestions/review');
    } catch (error) {
        console.error('Error approving suggestion:', error);
        req.flash('error', 'Unable to approve suggestion.');
        return res.redirect('/suggestions/review');
    }
};

/**
 * Reject suggestion
 */
const processRejectSuggestion = async (req, res) => {
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to reject suggestions.');
        return res.redirect('/dashboard');
    }

    const suggestionId = parseInt(req.params.id, 10);
    const { adminNotes } = req.body;

    try {
        const suggestion = await getSuggestionById(suggestionId);

        if (!suggestion) {
            req.flash('error', 'Suggestion not found.');
            return res.redirect('/suggestions/review');
        }

        await markSuggestionRejected(suggestionId, adminNotes || null);

        req.flash('success', 'Suggestion rejected.');
        return res.redirect('/suggestions/review');
    } catch (error) {
        console.error('Error rejecting suggestion:', error);
        req.flash('error', 'Unable to reject suggestion.');
        return res.redirect('/suggestions/review');
    }
};

router.get('/', requireLogin, showSuggestionPortal);
router.get('/new', requireLogin, showNewSuggestionForm);
router.post('/', requireLogin, suggestionValidation, handleCreateSuggestion);
router.get('/my-suggestions', requireLogin, showMySuggestions);
router.get('/review', requireLogin, showSuggestionReview);
router.get('/:id', requireLogin, showSuggestionDetail);
router.post('/:id/delete', requireLogin, processDeleteSuggestion);
router.post('/:id/approve', requireLogin, processApproveSuggestion);
router.post('/:id/reject', requireLogin, processRejectSuggestion);

export default router;