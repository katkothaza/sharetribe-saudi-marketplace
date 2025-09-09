const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let error = {
        status: err.statusCode || 500,
        message: err.message || 'Internal Server Error'
    };

    // Validation errors
    if (err.name === 'ValidationError') {
        error.status = 400;
        error.message = 'Validation Error';
        error.details = err.errors;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.status = 401;
        error.message = 'Invalid token';
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        error.status = 400;
        error.message = 'Duplicate field value entered';
    }

    // Send error response
    res.status(error.status).json({
        success: false,
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        ...(error.details && { details: error.details })
    });
};

module.exports = errorHandler;
