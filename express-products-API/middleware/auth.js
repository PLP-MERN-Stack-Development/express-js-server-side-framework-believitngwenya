const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    const error = new Error('API key is required');
    error.statusCode = 401;
    return next(error);
  }
  
  // In a real application, you would validate against a database
  // For this example, we'll use a simple hardcoded key
  const validApiKey = process.env.API_KEY || 'secret-key-123';
  
  if (apiKey !== validApiKey) {
    const error = new Error('Invalid API key');
    error.statusCode = 401;
    return next(error);
  }
  
  next();
};

module.exports = { authenticate };