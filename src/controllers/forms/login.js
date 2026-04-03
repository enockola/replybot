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
    let formData = {};

    const flashedFormData = req.flash('formData');
    if (flashedFormData.length > 0) {
        try {
            formData = JSON.parse(flashedFormData[0]);
        } catch {
            formData = {};
        }
    }

    res.render('forms/login/form', {
        title: 'User Login',
        formData
    });
};

/**
 * Process login form submission.
 */
const processLogin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        req.flash('formData', JSON.stringify({
            email: req.body.email
        }));

        return res.redirect('/login');
    }

    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            req.flash('error', 'Invalid email or password.');
            req.flash('formData', JSON.stringify({ email }));
            return res.redirect('/login');
        }

        const isValidPassword = await verifyPassword(password, user.password_hash);

        if (!isValidPassword) {
            req.flash('error', 'Invalid email or password.');
            req.flash('formData', JSON.stringify({ email }));
            return res.redirect('/login');
        }

        // SECURITY: Remove password hash before storing in session
        delete user.password_hash;

        req.session.user = user;

        req.flash('success', 'You have logged in successfully.');
        return res.redirect('/dashboard');
    } catch (error) {
        console.error('Error processing login:', error);
        req.flash('error', 'Something went wrong. Please try again.');
        req.flash('formData', JSON.stringify({ email }));
        return res.redirect('/login');
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
        return res.redirect('/');
    });
};

/**
 * Display protected dashboard (requires login).
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

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