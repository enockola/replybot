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

const router = Router();

router.get('/', homePage);
router.get('/dashboard', dashboardPage);
router.get('/about', aboutPage);
router.get('/resources', resourcesPage);

router.get('/responses', responsesPage);
router.get('/responses/:slug', responseDetailPage);

router.get('/test-error', testErrorPage);

export default router;