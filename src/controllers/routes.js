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

const router = Router();

router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/dashboard', dashboardPage);
router.get('/resources', resourcesPage);

router.get('/responses', responsesPage);
router.get('/responses/:slug', responseDetailPage);

// Contact form routes
router.use('/contact', contactRoutes);

router.get('/test-error', testErrorPage);

export default router;