import { Router } from 'express';
import {
  homePage,
  aboutPage,
  dashboardPage,
  resourcesPage,
  testErrorPage
} from './index.js';
import {
  responsesPage,
  responseDetailPage
} from './responses/response.js';
import contactRoutes from './forms/contact.js';
import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import { processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';

const router = Router();

router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/resources', resourcesPage);

router.get('/responses', responsesPage);
router.get('/responses/:slug', responseDetailPage);

// Contact form routes
router.use('/contact', contactRoutes);

router.use('/register', registrationRoutes);

router.get('/test-error', testErrorPage);

// Login routes (form and submission)
router.use('/login', loginRoutes);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

export default router;