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
    res.render('forms/registration/form', {
        title: 'User Registration',
        errors: [],
        formData: {}
    });
};

/**
 * Handle user registration with validation and password hashing.
 */
const processRegistration = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error('Registration validation errors:', errors.array());

        return res.status(400).render('forms/registration/form', {
            title: 'User Registration',
            errors: errors.array(),
            formData: req.body
        });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
        const doesEmailExist = await emailExists(email);

        if (doesEmailExist) {
            console.error('Email already registered');

            return res.status(400).render('forms/registration/form', {
                title: 'User Registration',
                errors: [{ msg: 'Email is already registered' }],
                formData: req.body
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // standard user role
        const roleId = 3;

        await saveUser(firstName, lastName, email, hashedPassword, roleId);

        console.log('User registered successfully');
        res.redirect('/register/list');
    } catch (error) {
        console.error('Error processing registration:', error);

        res.status(500).render('forms/registration/form', {
            title: 'User Registration',
            errors: [{ msg: 'Something went wrong. Please try again.' }],
            formData: req.body
        });
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