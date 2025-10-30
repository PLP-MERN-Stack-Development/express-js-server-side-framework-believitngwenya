const validateProduct = (req, res, next) => {
  const { name, description, price, category } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }

  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    errors.push('Price is required and must be a positive number');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = errors;
    return next(error);
  }

  next();
};

const validateProductUpdate = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  if (name && (typeof name !== 'string' || name.trim().length === 0)) {
    errors.push('Name must be a non-empty string');
  }

  if (description && (typeof description !== 'string' || description.trim().length === 0)) {
    errors.push('Description must be a non-empty string');
  }

  if (price && (isNaN(price) || parseFloat(price) <= 0)) {
    errors.push('Price must be a positive number');
  }

  if (category && (typeof category !== 'string' || category.trim().length === 0)) {
    errors.push('Category must be a non-empty string');
  }

  if (inStock !== undefined && typeof inStock !== 'boolean') {
    errors.push('inStock must be a boolean');
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = errors;
    return next(error);
  }

  next();
};

module.exports = { validateProduct, validateProductUpdate };