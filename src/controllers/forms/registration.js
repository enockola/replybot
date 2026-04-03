import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import {
    emailExists,
    saveUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../../models/forms/registration.js';
import { requireLogin } from '../../middleware/auth.js';

const router = Router();

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('firstName')
        .trim()
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters'),

    body('lastName')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Last name must be at least 2 characters'),

    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),

    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),

    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * Validation rules for editing user accounts
 */
const editValidation = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters')
        .matches(/^[A-Za-z\s'-]+$/)
        .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

    body('lastName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters')
        .matches(/^[A-Za-z\s'-]+$/)
        .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
];

/**
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    let formData = {};

    const flashedFormData = req.flash('formData');
    if (flashedFormData.length > 0) {
        try {
            formData = JSON.parse(flashedFormData[0]);
        } catch {
            formData = {};
        }
    }

    res.render('forms/registration/form', {
        title: 'User Registration',
        formData
    });
};

/**
 * Display the edit account form
 * Users can edit their own account, admins can edit any account
 */
const showEditAccountForm = async (req, res) => {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUser = req.session.user;

    try {
        const targetUser = await getUserById(targetUserId);

        if (!targetUser) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }

        const canEdit = currentUser.id === targetUserId || currentUser.roleName === 'admin';

        if (!canEdit) {
            req.flash('error', 'You do not have permission to edit this account.');
            return res.redirect('/register/list');
        }

        let formData = {};
        const flashedFormData = req.flash('formData');

        if (flashedFormData.length > 0) {
            try {
                formData = JSON.parse(flashedFormData[0]);
            } catch {
                formData = {};
            }
        }

        res.render('forms/registration/edit', {
            title: 'Edit Account',
            user: targetUser,
            formData
        });
    } catch (error) {
        console.error('Error loading edit account form:', error);
        req.flash('error', 'Unable to load the edit form.');
        return res.redirect('/register/list');
    }
};

/**
 * Handle user registration with validation and password hashing.
 */
const processRegistration = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        req.flash('formData', JSON.stringify({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            emailConfirm: req.body.emailConfirm
        }));

        return res.redirect('/register');
    }

    const { firstName, lastName, email, password } = req.body;

    try {
        const doesEmailExist = await emailExists(email);

        if (doesEmailExist) {
            req.flash('error', 'Email is already registered.');
            req.flash('formData', JSON.stringify({
                firstName,
                lastName,
                email,
                emailConfirm: req.body.emailConfirm
            }));
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // standard user role
        const roleId = 3;
        await saveUser(firstName, lastName, email, hashedPassword, roleId);

        req.flash('success', 'Registration successful. You can now log in.');
        return res.redirect('/login');
    } catch (error) {
        console.error('Error processing registration:', error);
        req.flash('error', 'Something went wrong. Please try again.');

        req.flash('formData', JSON.stringify({
            firstName,
            lastName,
            email,
            emailConfirm: req.body.emailConfirm
        }));

        return res.redirect('/register');
    }
};

/**
 * Process account edit form submission
 */
const processEditAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUser = req.session.user;
    const { firstName, lastName, email } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        req.flash('formData', JSON.stringify({
            firstName,
            lastName,
            email
        }));

        return res.redirect(`/register/${targetUserId}/edit`);
    }

    try {
        const targetUser = await getUserById(targetUserId);

        if (!targetUser) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }

        const canEdit = currentUser.id === targetUserId || currentUser.roleName === 'admin';

        if (!canEdit) {
            req.flash('error', 'You do not have permission to edit this account.');
            return res.redirect('/register/list');
        }

        const emailTaken = await emailExists(email);
        if (emailTaken && targetUser.email.toLowerCase() !== email.toLowerCase()) {
            req.flash('error', 'An account with this email already exists.');
            req.flash('formData', JSON.stringify({
                firstName,
                lastName,
                email
            }));
            return res.redirect(`/register/${targetUserId}/edit`);
        }

        const updatedUser = await updateUser(targetUserId, firstName, lastName, email);

        if (!updatedUser) {
            req.flash('error', 'User could not be updated.');
            return res.redirect(`/register/${targetUserId}/edit`);
        }

        // If user edited their own account, update session to match DB fields
        if (currentUser.id === targetUserId) {
            req.session.user.first_name = updatedUser.first_name;
            req.session.user.last_name = updatedUser.last_name;
            req.session.user.email = updatedUser.email;
        }

        req.flash('success', 'Account updated successfully.');
        return res.redirect('/register/list');
    } catch (error) {
        console.error('Error updating account:', error);
        req.flash('error', 'An error occurred while updating the account.');
        req.flash('formData', JSON.stringify({
            firstName,
            lastName,
            email
        }));
        return res.redirect(`/register/${targetUserId}/edit`);
    }
};

/**
 * Process account deletion
 * Only admins can delete accounts, and they cannot delete themselves
 */
const processDeleteAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to delete accounts.');
        return res.redirect('/register/list');
    }

    if (currentUser.id === targetUserId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/register/list');
    }

    try {
        const deleted = await deleteUser(targetUserId);

        if (deleted) {
            req.flash('success', 'User account deleted successfully.');
        } else {
            req.flash('error', 'User not found or already deleted.');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'An error occurred while deleting the account.');
    }

    return res.redirect('/register/list');
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    let users = [];

    try {
        users = await getAllUsers();
    } catch (error) {
        console.error('Error retrieving users:', error);
        req.flash('error', 'Unable to load registered users.');
    }

    res.render('forms/registration/list', {
        title: 'Registered Users',
        users,
        user: req.session && req.session.user ? req.session.user : null
    });
};

/**
 * Routes
 */
router.get('/', showRegistrationForm);
router.post('/', registrationValidation, processRegistration);
router.get('/list', showAllUsers);
router.get('/:id/edit', requireLogin, showEditAccountForm);
router.post('/:id/edit', requireLogin, editValidation, processEditAccount);
router.post('/:id/delete', requireLogin, processDeleteAccount);

export default router;