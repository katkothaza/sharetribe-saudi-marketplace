const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { createPaymentSession } = require('../config/store');

const router = express.Router();

// Validation helper functions
const validateSTCPayment = (paymentData) => {
    const errors = [];

    // Validate mobile number (Saudi Arabia format)
    if (!paymentData.mobile_number) {
        errors.push('Mobile number is required');
    } else {
        // Saudi mobile numbers: +966 5XXXXXXXX or 05XXXXXXXX
        const mobileRegex = /^(\+966|966|0)?5[0-9]{8}$/;
        const cleanMobile = paymentData.mobile_number.replace(/[\s-]/g, '');
        
        if (!mobileRegex.test(cleanMobile)) {
            errors.push('Invalid Saudi mobile number format (should be 05XXXXXXXX or +966 5XXXXXXXX)');
        }
    }

    // Validate amount
    if (!paymentData.amount) {
        errors.push('Amount is required');
    } else if (isNaN(paymentData.amount) || parseFloat(paymentData.amount) <= 0) {
        errors.push('Invalid amount');
    } else if (parseFloat(paymentData.amount) < 1) {
        errors.push('Minimum transaction amount is 1 SAR');
    } else if (parseFloat(paymentData.amount) > 50000) {
        errors.push('Maximum transaction amount is 50,000 SAR');
    }

    // Validate currency (STCpay only supports SAR)
    if (paymentData.currency && paymentData.currency !== 'SAR') {
        errors.push('STCpay only supports SAR currency');
    }

    // Validate order reference
    if (!paymentData.order_reference) {
        errors.push('Order reference is required');
    } else if (paymentData.order_reference.length < 3) {
        errors.push('Order reference too short (minimum 3 characters)');
    }

    return errors;
};

const formatSaudiMobile = (mobile) => {
    const cleanMobile = mobile.replace(/[\s-]/g, '');
    
    if (cleanMobile.startsWith('+966')) {
        return cleanMobile;
    } else if (cleanMobile.startsWith('966')) {
        return `+${cleanMobile}`;
    } else if (cleanMobile.startsWith('05')) {
        return `+966${cleanMobile.substring(1)}`;
    } else if (cleanMobile.startsWith('5')) {
        return `+966${cleanMobile}`;
    }
    
    return cleanMobile;
};

// Create STC Pay payment
router.post('/payment', (req, res) => {
    try {
        const validationErrors = validateSTCPayment(req.body);
        
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }

        const paymentId = uuidv4();
        const amount = parseFloat(req.body.amount);
        const currency = 'SAR'; // STCpay only supports SAR
        const formattedMobile = formatSaudiMobile(req.body.mobile_number);

        // Create session for verification
        const session = createPaymentSession({
            method: 'stcpay',
            amount,
            currency,
            returnUrl: req.body.return_url
        });

        // Simulate STC Pay payment processing
        const response = {
            success: true,
            payment_id: paymentId,
            transaction_reference: `STC${Date.now()}${Math.floor(Math.random() * 1000)}`,
            status: 'pending_otp',
            amount: amount,
            currency: currency,
            mobile_number: formattedMobile,
            order_reference: req.body.order_reference,
            otp_required: true,
            next_action: {
                type: 'redirect_to_url',
                redirect_to_url: {
                    url: `${req.protocol}://${req.get('host')}/verify/stcpay/${session.id}`,
                    return_url: req.body.return_url || `${req.protocol}://${req.get('host')}/api/v1/stcpay/callback`
                }
            },
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
            created_at: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'STC Pay payment processing failed',
            message: error.message
        });
    }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
    try {
        const { payment_id, otp } = req.body;

        if (!payment_id || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Payment ID and OTP are required'
            });
        }

        // In a real implementation, you would verify the OTP
        // For simulation, we'll always approve if OTP is provided
        const response = {
            success: true,
            payment_id,
            status: 'succeeded',
            message: 'Payment completed successfully',
            transaction_reference: `STC${Date.now()}${Math.floor(Math.random() * 1000)}`,
            verified_at: new Date().toISOString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'OTP verification failed',
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
            transaction_reference: `STC${Date.now()}${Math.floor(Math.random() * 1000)}`,
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
        const { payment_id, status, transaction_reference } = req.body;

        const response = {
            success: true,
            message: 'STC Pay callback processed',
            payment_id,
            status: status || 'succeeded',
            transaction_reference,
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
            transaction_reference: `STCR${Date.now()}${Math.floor(Math.random() * 1000)}`,
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
