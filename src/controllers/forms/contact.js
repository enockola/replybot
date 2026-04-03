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
        formData: {}
    });
};

const handleContactSubmission = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        req.flash('formData', JSON.stringify(req.body));
        return res.redirect('/contact');
    }

    const { name, email, subject, message } = req.body;

    try {
        await createContactForm(name, email, subject, message);
        req.flash('success', 'Thank you for contacting us! We will respond soon.');
        return res.redirect('/contact');
    } catch (error) {
        console.error('Error saving contact form:', error);
        req.flash('error', 'Unable to submit your message. Please try again later.');
        req.flash('formData', JSON.stringify(req.body));
        return res.redirect('/contact');
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
        req.flash('error', 'Unable to load contact form submissions.');
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
            req.flash('error', 'Submission not found.');
            return res.redirect('/contact/replies');
        }

        req.flash('success', 'Submission deleted successfully.');
        return res.redirect('/contact/replies');
    } catch (error) {
        console.error('Error deleting contact form:', error);
        req.flash('error', 'Could not delete submission.');
        return res.redirect('/contact/replies');
    }
};

router.get('/', (req, res) => {
    let formData = {};

    const flashedFormData = req.flash('formData');
    if (flashedFormData.length > 0) {
        try {
            formData = JSON.parse(flashedFormData[0]);
        } catch {
            formData = {};
        }
    }

    res.render('forms/contact/form', {
        title: 'Contact Us',
        formData
    });
});

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