// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err.message);
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'CastError')  { status = 400; message = 'Invalid ID'; }
  if (err.code === 11000)        { status = 400; message = 'Email already registered'; }
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
