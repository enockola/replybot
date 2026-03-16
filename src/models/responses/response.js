import db from '../db.js';

// Get all response categories
const getAllResponseCategories = async () => {
  const result = await db.query(`
    SELECT id, name, slug, description
    FROM response_categories
    ORDER BY display_order ASC;
  `);

  return result.rows;
};

// Get one category by slug
const getResponseCategoryBySlug = async (slug) => {
  const result = await db.query(`
    SELECT id, name, slug, description
    FROM response_categories
    WHERE slug = $1
    LIMIT 1;
  `, [slug]);

  return result.rows[0] || null;
};

// Get all responses for one category
const getResponsesByCategoryId = async (categoryId) => {
  const result = await db.query(`
    SELECT id, content
    FROM canned_responses
    WHERE category_id = $1
    AND is_active = TRUE
    ORDER BY id;
  `, [categoryId]);

  return result.rows;
};

// Get one category and all its responses together
const getResponseCategoryWithResponses = async (slug) => {
  const category = await getResponseCategoryBySlug(slug);

  if (!category) {
    return null;
  }

  const responses = await getResponsesByCategoryId(category.id);

  return {
    ...category,
    responses: responses.map((row) => ({
      id: row.id,
      text: row.content
    }))
  };
};

export {
  getAllResponseCategories,
  getResponseCategoryBySlug,
  getResponsesByCategoryId,
  getResponseCategoryWithResponses
};