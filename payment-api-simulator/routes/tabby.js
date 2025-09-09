const express = require('express');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const { createPaymentSession } = require('../config/store');

const router = express.Router();

// Validation helper functions
const validateTabbyPayment = (paymentData) => {
    const errors = [];

    // Validate amount
    if (!paymentData.amount) {
        errors.push('Amount is required');
    } else if (isNaN(paymentData.amount) || parseFloat(paymentData.amount) <= 0) {
        errors.push('Invalid amount');
    } else if (parseFloat(paymentData.amount) < 50) {
        errors.push('Minimum transaction amount is 50 SAR');
    } else if (parseFloat(paymentData.amount) > 50000) {
        errors.push('Maximum transaction amount is 50,000 SAR');
    }

    // Validate currency (Tabby supports SAR and AED primarily)
    if (!paymentData.currency) {
        errors.push('Currency is required');
    } else if (!['SAR', 'AED'].includes(paymentData.currency)) {
        errors.push('Tabby only supports SAR and AED currencies');
    }

    // Validate buyer information
    if (!paymentData.buyer) {
        errors.push('Buyer information is required');
    } else {
        const buyer = paymentData.buyer;
        
        if (!buyer.email) {
            errors.push('Buyer email is required');
        } else if (!validator.isEmail(buyer.email)) {
            errors.push('Invalid email format');
        }
        
        if (!buyer.phone) {
            errors.push('Buyer phone number is required');
        } else if (!/^(\+966|966|0)?5[0-9]{8}$/.test(buyer.phone.replace(/[\s-]/g, ''))) {
            errors.push('Invalid phone number format (Saudi numbers preferred)');
        }
        
        if (!buyer.name) {
            errors.push('Buyer name is required');
        } else if (buyer.name.length < 2) {
            errors.push('Buyer name too short');
        }
        
        if (!buyer.dob) {
            errors.push('Buyer date of birth is required');
        } else {
            const dobDate = new Date(buyer.dob);
            const today = new Date();
            const age = today.getFullYear() - dobDate.getFullYear();
            if (age < 18) {
                errors.push('Buyer must be at least 18 years old');
            }
        }
    }

    // Validate shipping address
    if (!paymentData.shipping_address) {
        errors.push('Shipping address is required');
    } else {
        const address = paymentData.shipping_address;
        
        if (!address.city) {
            errors.push('Shipping city is required');
        }
        
        if (!address.address_line_1) {
            errors.push('Shipping address line 1 is required');
        }
        
        if (!address.zip) {
            errors.push('Shipping zip code is required');
        }
    }

    // Validate order items
    if (!paymentData.order || !paymentData.order.items || !Array.isArray(paymentData.order.items)) {
        errors.push('Order items are required');
    } else if (paymentData.order.items.length === 0) {
        errors.push('At least one order item is required');
    } else {
        paymentData.order.items.forEach((item, index) => {
            if (!item.title) {
                errors.push(`Item ${index + 1}: Title is required`);
            }
            if (!item.unit_price || parseFloat(item.unit_price) <= 0) {
                errors.push(`Item ${index + 1}: Valid unit price is required`);
            }
            if (!item.quantity || parseInt(item.quantity) <= 0) {
                errors.push(`Item ${index + 1}: Valid quantity is required`);
            }
        });
    }

    return errors;
};

// Create Tabby payment session
router.post('/checkout', (req, res) => {
    try {
        const validationErrors = validateTabbyPayment(req.body);
        
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }

        const paymentId = uuidv4();
        const amount = parseFloat(req.body.amount);
        const currency = req.body.currency;

        // Create session for verification
        const session = createPaymentSession({
            method: 'tabby',
            amount,
            currency,
            returnUrl: req.body.merchant_urls?.success
        });

        // Calculate installment plan (4 equal payments)
        const installmentAmount = (amount / 4).toFixed(2);

        // Simulate Tabby payment processing
        const response = {
            success: true,
            payment_id: paymentId,
            status: 'created',
            amount: amount,
            currency: currency,
            installments_count: 4,
            installment_amount: parseFloat(installmentAmount),
            configuration: {
                id: `conf_${Date.now()}`,
                available_products: {
                    installments: [{
                        type: 'monthly',
                        count: 4,
                        web_url: `${req.protocol}://${req.get('host')}/verify/tabby/${session.id}`
                    }]
                }
            },
            payment_method: {
                type: 'installments',
                installments_count: 4
            },
            merchant_urls: {
                success: req.body.merchant_urls?.success || `${req.protocol}://${req.get('host')}/api/v1/tabby/callback?status=approved`,
                cancel: req.body.merchant_urls?.cancel || `${req.protocol}://${req.get('host')}/api/v1/tabby/callback?status=rejected`,
                failure: req.body.merchant_urls?.failure || `${req.protocol}://${req.get('host')}/api/v1/tabby/callback?status=failed`
            },
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Tabby checkout creation failed',
            message: error.message
        });
    }
});

// Capture payment (complete installment setup)
router.post('/capture', (req, res) => {
    try {
        const { payment_id, amount } = req.body;

        if (!payment_id) {
            return res.status(400).json({
                success: false,
                error: 'Payment ID is required'
            });
        }

        const response = {
            success: true,
            id: payment_id,
            status: 'authorized',
            amount: amount || 100.00,
            currency: 'SAR',
            captures: [{
                id: `cap_${uuidv4()}`,
                amount: amount || 100.00,
                created_at: new Date().toISOString()
            }],
            captured_at: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Payment capture failed',
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
            id: paymentId,
            status: 'authorized',
            amount: 100.00,
            currency: 'SAR',
            installments: {
                count: 4,
                amount_per_installment: 25.00,
                schedule: [
                    { due_date: new Date(Date.now() + 0).toISOString().split('T')[0], amount: 25.00 },
                    { due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 25.00 },
                    { due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 25.00 },
                    { due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 25.00 }
                ]
            },
            created_at: new Date().toISOString()
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
        const queryStatus = req.query.status;

        const response = {
            success: true,
            message: 'Tabby callback processed',
            payment_id,
            status: status || queryStatus || 'approved',
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
            id: refundId,
            payment_id,
            amount: amount || 'full',
            reason: reason || 'requested_by_customer',
            status: 'approved',
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

// Close payment (for completed installment plans)
router.post('/close', (req, res) => {
    try {
        const { payment_id } = req.body;

        if (!payment_id) {
            return res.status(400).json({
                success: false,
                error: 'Payment ID is required'
            });
        }
        
        const response = {
            success: true,
            id: payment_id,
            status: 'closed',
            closed_at: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Payment closure failed',
            message: error.message
        });
    }
});

module.exports = router;
