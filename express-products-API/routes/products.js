const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Import middleware
const { logger } = require('../middleware/logger');
const { authenticate } = require('../middleware/auth');
const { validateProduct, validateProductUpdate } = require('../middleware/validation');

// In-memory storage (in real app, this would be a database)
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance gaming laptop',
    price: 1299.99,
    category: 'Electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Coffee Mug',
    description: 'Ceramic coffee mug with handle',
    price: 12.99,
    category: 'Kitchen',
    inStock: true
  },
  {
    id: '3',
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    price: 34.99,
    category: 'Home',
    inStock: false
  }
];

// Apply logger middleware to all routes
router.use(logger);

// GET /api/products - List all products with filtering and pagination
router.get('/', (req, res) => {
  try {
    let filteredProducts = [...products];
    
    // Filter by category
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    
    // Filter by inStock
    if (req.query.inStock) {
      const inStock = req.query.inStock === 'true';
      filteredProducts = filteredProducts.filter(product => product.inStock === inStock);
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const result = {
      total: filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit),
      data: filteredProducts.slice(startIndex, endIndex)
    };
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get specific product by ID
router.get('/:id', (req, res, next) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create new product (with auth and validation)
router.post('/', authenticate, validateProduct, (req, res, next) => {
  try {
    const newProduct = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      inStock: Boolean(req.body.inStock)
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update existing product
router.put('/:id', authenticate, validateProductUpdate, (req, res, next) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Update product
    products[productIndex] = {
      ...products[productIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    res.json({
      message: 'Product updated successfully',
      product: products[productIndex]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', authenticate, (req, res, next) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    next(error);
  }
});

// Advanced Features

// GET /api/products/search?q=query - Search products by name
router.get('/search', (req, res, next) => {
  try {
    const query = req.query.q?.toLowerCase();
    
    if (!query) {
      return res.status(400).json({
        error: 'Search query is required',
        message: 'Please provide a search query using the "q" parameter'
      });
    }
    
    const searchResults = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
    
    res.json({
      query,
      total: searchResults.length,
      results: searchResults
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/stats - Get product statistics
router.get('/stats', (req, res, next) => {
  try {
    const stats = {
      totalProducts: products.length,
      inStock: products.filter(p => p.inStock).length,
      outOfStock: products.filter(p => !p.inStock).length,
      categories: {},
      priceStats: {
        highest: Math.max(...products.map(p => p.price)),
        lowest: Math.min(...products.map(p => p.price)),
        average: products.reduce((sum, p) => sum + p.price, 0) / products.length
      }
    };
    
    // Count by category
    products.forEach(product => {
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    });
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;