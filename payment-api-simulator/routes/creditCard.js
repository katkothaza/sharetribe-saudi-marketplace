const express = require('express');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');

const router = express.Router();

// Validation helper functions
const validateCreditCard = (cardData) => {
    const errors = [];

    // Validate card number
    if (!cardData.card_number) {
        errors.push('Card number is required');
    } else if (!validator.isCreditCard(cardData.card_number.replace(/\s/g, ''))) {
        errors.push('Invalid card number format');
    }

    // Validate expiry date
    if (!cardData.expiry_date) {
        errors.push('Expiry date is required');
    } else {
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/;
        if (!expiryRegex.test(cardData.expiry_date)) {
            errors.push('Invalid expiry date format (MM/YY or MM/YYYY required)');
        } else {
            const [month, year] = cardData.expiry_date.split('/');
            const fullYear = year.length === 2 ? `20${year}` : year;
            const expiryDate = new Date(parseInt(fullYear), parseInt(month) - 1);
            if (expiryDate < new Date()) {
                errors.push('Card has expired');
            }
        }
    }

    // Validate CVV
    if (!cardData.cvv) {
        errors.push('CVV is required');
    } else if (!/^\d{3,4}$/.test(cardData.cvv)) {
        errors.push('Invalid CVV format (3 or 4 digits required)');
    }

    // Validate cardholder name
    if (!cardData.cardholder_name) {
        errors.push('Cardholder name is required');
    } else if (cardData.cardholder_name.length < 2) {
        errors.push('Cardholder name too short');
    }

    // Validate amount
    if (!cardData.amount) {
        errors.push('Amount is required');
    } else if (isNaN(cardData.amount) || parseFloat(cardData.amount) <= 0) {
        errors.push('Invalid amount');
    }

    // Validate currency (optional, default to SAR)
    if (cardData.currency && !['SAR', 'USD', 'EUR'].includes(cardData.currency)) {
        errors.push('Unsupported currency');
    }

    return errors;
};

// Create payment intent
router.post('/payment-intent', (req, res) => {
    try {
        const validationErrors = validateCreditCard(req.body);
        
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }

        const paymentId = uuidv4();
        const amount = parseFloat(req.body.amount);
        const currency = req.body.currency || 'SAR';

        // Simulate payment processing
        const response = {
            success: true,
            payment_id: paymentId,
            status: 'requires_action',
            amount: amount,
            currency: currency,
            client_secret: `pi_${paymentId}_secret_${Date.now()}`,
            next_action: {
                type: 'redirect_to_url',
                redirect_to_url: {
                    url: `${req.protocol}://${req.get('host')}/verify/creditcard/${paymentId}`,
                    return_url: req.body.return_url || `${req.protocol}://${req.get('host')}/api/v1/creditcard/callback`
                }
            },
            created_at: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Payment processing failed',
            message: error.message
        });
    }
});

// Get payment status
router.get('/payment/:paymentId', (req, res) => {
    try {
        const { paymentId } = req.params;

        // Simulate payment status check
        const response = {
            success: true,
            payment_id: paymentId,
            status: 'succeeded', // In real scenario, this would be dynamic
            amount: 100.00,
            currency: 'SAR',
            processed_at: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve payment status',
            message: error.message
        });
    }
});

// Payment callback endpoint
router.post('/callback', (req, res) => {
    try {
        const { payment_id, status } = req.body;

        const response = {
            success: true,
            message: 'Payment callback processed',
            payment_id,
            status: status || 'succeeded',
            processed_at: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Callback processing failed',
            message: error.message
        });
    }
});

// Refund endpoint
router.post('/refund', (req, res) => {
    try {
        const { payment_id, amount, reason } = req.body;

        if (!payment_id) {
            return res.status(400).json({
                success: false,
                error: 'Payment ID is required for refund'
            });
        }

        const refundId = uuidv4();
        
        const response = {
            success: true,
            refund_id: refundId,
            payment_id,
            amount: amount || 'full',
            reason: reason || 'requested_by_customer',
            status: 'succeeded',
            processed_at: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Refund processing failed',
            message: error.message
        });
    }
});

module.exports = router;
