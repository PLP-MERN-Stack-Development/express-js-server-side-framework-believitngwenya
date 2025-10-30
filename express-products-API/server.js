const express = require('express');
const productRoutes = require('./routes/products');
const { errorHandler } = require('./utils/errors');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World! Welcome to Products API',
    endpoints: {
      getAll: 'GET /api/products',
      getById: 'GET /api/products/:id',
      create: 'POST /api/products',
      update: 'PUT /api/products/:id',
      delete: 'DELETE /api/products/:id',
      search: 'GET /api/products/search?q=name',
      stats: 'GET /api/products/stats'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test the API`);
});

module.exports = app;