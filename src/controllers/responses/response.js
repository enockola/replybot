import { 
  getAllResponses,
  getResponseCategoryBySlug,
  getResponseCategoryByName,
  getAllResponseSlugs,
} from '../../models/responses/response.js';

// Route handler for responses list page
const responsesPage = (req, res) => {
    const cannedResponses = getAllResponses();

    res.render('responses', {
        title: 'Canned Responses',
        cannedResponses
    });
};

// Route handler for individual response category
const responseDetailPage = (req, res, next) => {
    const slug = req.params.slug;

    const category = getResponseCategoryBySlug(slug);

    if (!category) {
        const err = new Error(`Response category "${slug}" not found`);
        err.status = 404;
        return next(err);
    }

    const cannedResponses = getAllResponses();

    res.render('response-details', {
        title: category.name,
        category,
        cannedResponses
    });
};

export { responsesPage, responseDetailPage };