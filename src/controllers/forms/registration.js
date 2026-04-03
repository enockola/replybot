import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import {
    emailExists,
    saveUser,
    getAllUsers
} from '../../models/forms/registration.js';

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
        users
    });
};

/**
 * Routes
 */
router.get('/', showRegistrationForm);
router.post('/', registrationValidation, processRegistration);
router.get('/list', showAllUsers);

export default router;