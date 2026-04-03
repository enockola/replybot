import { body, validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';

const router = Router();

/**
 * Validation rules for login form
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password is required')
];

/**
 * Display the login form.
 */
const showLoginForm = (req, res) => {
    res.render('forms/login/form', {
        title: 'User Login',
        errors: [],
        formData: {}
    });
};

/**
 * Process login form submission.
 */
const processLogin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error('Login validation errors:', errors.array());

        return res.status(400).render('forms/login/form', {
            title: 'User Login',
            errors: errors.array(),
            formData: req.body
        });
    }

    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            console.error('User not found');

            return res.status(400).render('forms/login/form', {
                title: 'User Login',
                errors: [{ msg: 'Invalid email or password' }],
                formData: req.body
            });
        }

        const isValidPassword = await verifyPassword(password, user.password_hash);

        if (!isValidPassword) {
            console.error('Invalid password');

            return res.status(400).render('forms/login/form', {
                title: 'User Login',
                errors: [{ msg: 'Invalid email or password' }],
                formData: req.body
            });
        }

        // SECURITY: Remove password hash before storing in session
        delete user.password_hash;

        req.session.user = user;

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error processing login:', error);

        res.status(500).render('forms/login/form', {
            title: 'User Login',
            errors: [{ msg: 'Something went wrong. Please try again.' }],
            formData: req.body
        });
    }
};

/**
 * Handle user logout.
 */
const processLogout = (req, res) => {
    if (!req.session) {
        return res.redirect('/');
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.clearCookie('connect.sid');
            return res.redirect('/');
        }

        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

/**
 * Display protected dashboard (requires login).
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

    // Security check
    if (user && user.password_hash) {
        console.error('Security error: password_hash found in user object');
        delete user.password_hash;
    }

    if (sessionData.user && sessionData.user.password_hash) {
        console.error('Security error: password_hash found in sessionData.user');
        delete sessionData.user.password_hash;
    }

    res.render('dashboard', {
        title: 'Dashboard',
        user,
        sessionData
    });
};

// Routes
router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

export default router;
export { processLogout, showDashboard };