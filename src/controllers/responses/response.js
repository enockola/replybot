import {
  getAllResponseCategories,
  getResponseCategoryWithResponses
} from '../../models/responses/response.js';

// Route handler for responses list page
const responsesPage = async (req, res, next) => {
  try {
    const cannedResponses = await getAllResponseCategories();

    res.render('responses/category', {
      title: 'Canned Responses',
      cannedResponses
    });
  } catch (error) {
    next(error);
  }
};

// Route handler for individual response category
const responseDetailPage = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    const category = await getResponseCategoryWithResponses(slug);

    if (!category) {
      const err = new Error(`Response category "${slug}" not found`);
      err.status = 404;
      return next(err);
    }

    const cannedResponses = await getAllResponseCategories();

    res.render('responses/list', {
      title: category.name,
      category,
      cannedResponses
    });
  } catch (error) {
    next(error);
  }
};

export { responsesPage, responseDetailPage };