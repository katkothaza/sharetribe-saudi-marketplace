const { getValidApiKeys, getPaymentMethodByApiKey } = require('../config/apiKeys');

const authMiddleware = (req, res, next) => {
    try {
        // Get API key from various possible locations
        let apiKey = null;
        
        // Check Authorization header (Bearer token)
        if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                apiKey = authHeader.substring(7);
            } else {
                apiKey = authHeader;
            }
        }
        
        // Check X-API-Key header
        if (!apiKey && req.headers['x-api-key']) {
            apiKey = req.headers['x-api-key'];
        }
        
        // Check query parameter
        if (!apiKey && req.query.api_key) {
            apiKey = req.query.api_key;
        }

        // Validate API key exists
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key required',
                message: 'Please provide an API key via Authorization header, X-API-Key header, or api_key query parameter'
            });
        }

        // Validate API key is valid
        const currentValidKeys = getValidApiKeys();
        if (!currentValidKeys.includes(apiKey)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key',
                message: 'The provided API key is not valid'
            });
        }

        // Get payment method info and attach to request
        const paymentMethodInfo = getPaymentMethodByApiKey(apiKey);
        req.paymentMethod = paymentMethodInfo;
        req.apiKey = apiKey;

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Authentication error',
            message: 'An error occurred while validating the API key'
        });
    }
};

module.exports = authMiddleware;
