import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
    createContactForm,
    getAllContactForms,
    deleteContactFormById
} from '../../models/forms/contact.js';

const router = Router();

const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Us',
        errors: [],
        formData: {}
    });
};

const handleContactSubmission = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render('forms/contact/form', {
            title: 'Contact Us',
            errors: errors.array(),
            formData: req.body
        });
    }

    const { name, email, subject, message } = req.body;

    try {
        await createContactForm(name, email, subject, message);
        console.log('Contact form submitted successfully');
        res.redirect('/contact/success');
    } catch (error) {
        console.error('Error saving contact form:', error);
        res.status(500).render('forms/contact/form', {
            title: 'Contact Us',
            errors: [{ msg: 'Something went wrong. Please try again.' }],
            formData: req.body
        });
    }
};

const showContactSuccess = (req, res) => {
    res.render('forms/contact/success', {
        title: 'Message Sent'
    });
};

const showContactResponses = async (req, res) => {
    let contactForms = [];

    try {
        contactForms = await getAllContactForms();
    } catch (error) {
        console.error('Error retrieving contact forms:', error);
    }

    res.render('forms/contact/replies', {
        title: 'Contact Form Submissions',
        contactForms
    });
};

const handleDeleteContactResponse = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await deleteContactFormById(id);

        if (!deleted) {
            return res.status(404).send('Submission not found');
        }

        res.redirect('/contact/replies');
    } catch (error) {
        console.error('Error deleting contact form:', error);
        res.status(500).send('Could not delete submission');
    }
};

router.get('/', showContactForm);

router.post(
    '/',
    [
        body('name')
            .trim()
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please enter a valid email address'),
        body('subject')
            .trim()
            .isLength({ min: 2 })
            .withMessage('Subject must be at least 2 characters'),
        body('message')
            .trim()
            .isLength({ min: 10 })
            .withMessage('Message must be at least 10 characters')
    ],
    handleContactSubmission
);

router.get('/success', showContactSuccess);
router.get('/replies', showContactResponses);
router.post('/replies/:id/delete', handleDeleteContactResponse);

export default router;