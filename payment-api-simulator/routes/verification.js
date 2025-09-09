const express = require('express');
const path = require('path');
const { getSession, approveSession } = require('../config/store');

const router = express.Router();

// Credit Card verification page
router.get('/creditcard/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = getSession(sessionId);

        if (!session) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payment Verification - Not Found</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                        .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .error { color: #d32f2f; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2 class="error">Session Not Found</h2>
                        <p>The payment session could not be found or has expired.</p>
                    </div>
                </body>
                </html>
            `);
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Credit Card Verification - Payment Simulator</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                    .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .amount { font-size: 24px; font-weight: bold; color: #1976d2; text-align: center; margin: 20px 0; }
                    .otp-display { background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1976d2; }
                    .info { color: #666; font-size: 14px; text-align: center; margin: 15px 0; }
                    .btn { background: #4caf50; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; width: 100%; margin: 10px 0; }
                    .btn:hover { background: #45a049; }
                    .cancel-btn { background: #f44336; }
                    .cancel-btn:hover { background: #da190b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>💳 Credit Card Verification</h2>
                        <p>Payment Simulator</p>
                    </div>
                    
                    <div class="amount">${session.amount} ${session.currency}</div>
                    
                    <div class="otp-display">
                        <p>Your verification code:</p>
                        <div class="otp-code">${session.otp}</div>
                    </div>
                    
                    <p class="info">In a real payment gateway, this code would be sent to your registered mobile number. For simulation purposes, it's displayed here.</p>
                    
                    <button class="btn" id="approveBtn">✅ Approve Payment</button>
                    <button class="btn cancel-btn" id="rejectBtn">❌ Cancel Payment</button>
                    
                    <p class="info">This is a simulation environment. No real charges will be made.</p>
                </div>

                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        document.getElementById('approveBtn').addEventListener('click', approvePayment);
                        document.getElementById('rejectBtn').addEventListener('click', rejectPayment);
                    });
                    
                    function approvePayment() {
                        fetch('/verify/approve/${sessionId}', { method: 'POST' })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success && data.returnUrl) {
                                    window.location.href = data.returnUrl + '?status=approved&session_id=${sessionId}';
                                } else {
                                    alert('Payment approved! You can close this window.');
                                }
                            })
                            .catch(err => alert('Payment approved! You can close this window.'));
                    }
                    
                    function rejectPayment() {
                        const returnUrl = '${session.returnUrl || '/'}';
                        window.location.href = returnUrl + '?status=cancelled&session_id=${sessionId}';
                    }
                </script>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        res.status(500).send('Error loading verification page');
    }
});

// STC Pay verification page
router.get('/stcpay/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = getSession(sessionId);

        if (!session) {
            return res.status(404).send('Session not found');
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>STC Pay Verification - Payment Simulator</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                    .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .stc-logo { background: #673ab7; color: white; padding: 10px; border-radius: 5px; display: inline-block; margin-bottom: 20px; }
                    .amount { font-size: 24px; font-weight: bold; color: #673ab7; text-align: center; margin: 20px 0; }
                    .otp-display { background: #f3e5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #673ab7; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #673ab7; }
                    .info { color: #666; font-size: 14px; text-align: center; margin: 15px 0; }
                    .btn { background: #673ab7; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; width: 100%; margin: 10px 0; }
                    .btn:hover { background: #563c96; }
                    .cancel-btn { background: #f44336; }
                    .cancel-btn:hover { background: #da190b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="stc-logo">📱 STC Pay</div>
                        <h2>Payment Verification</h2>
                        <p>Payment Simulator</p>
                    </div>
                    
                    <div class="amount">${session.amount} ${session.currency}</div>
                    
                    <div class="otp-display">
                        <p>Your STC Pay OTP:</p>
                        <div class="otp-code">${session.otp}</div>
                        <p style="font-size: 12px; margin-top: 10px;">Valid for 15 minutes</p>
                    </div>
                    
                    <p class="info">In a real STC Pay transaction, this OTP would be sent to your registered mobile number. For simulation purposes, it's displayed here.</p>
                    
                    <button class="btn" id="stcApproveBtn">✅ Confirm Payment</button>
                    <button class="btn cancel-btn" id="stcRejectBtn">❌ Cancel Payment</button>
                    
                    <p class="info">This is a simulation environment. No real charges will be made.</p>
                </div>

                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        document.getElementById('stcApproveBtn').addEventListener('click', approvePayment);
                        document.getElementById('stcRejectBtn').addEventListener('click', rejectPayment);
                    });
                    
                    function approvePayment() {
                        fetch('/verify/approve/${sessionId}', { method: 'POST' })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success && data.returnUrl) {
                                    window.location.href = data.returnUrl + '?status=approved&session_id=${sessionId}';
                                } else {
                                    alert('Payment approved! You can close this window.');
                                }
                            })
                            .catch(err => alert('Payment approved! You can close this window.'));
                    }
                    
                    function rejectPayment() {
                        const returnUrl = '${session.returnUrl || '/'}';
                        window.location.href = returnUrl + '?status=cancelled&session_id=${sessionId}';
                    }
                </script>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        res.status(500).send('Error loading verification page');
    }
});

// Tabby verification page
router.get('/tabby/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = getSession(sessionId);

        if (!session) {
            return res.status(404).send('Session not found');
        }

        const installmentAmount = (session.amount / 4).toFixed(2);

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Tabby Verification - Payment Simulator</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                    .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .tabby-logo { background: #ff6b35; color: white; padding: 10px; border-radius: 5px; display: inline-block; margin-bottom: 20px; }
                    .amount { font-size: 24px; font-weight: bold; color: #ff6b35; text-align: center; margin: 20px 0; }
                    .installment-info { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35; }
                    .otp-display { background: #fff3e0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ff6b35; }
                    .info { color: #666; font-size: 14px; text-align: center; margin: 15px 0; }
                    .btn { background: #ff6b35; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; width: 100%; margin: 10px 0; }
                    .btn:hover { background: #e55a2b; }
                    .cancel-btn { background: #f44336; }
                    .cancel-btn:hover { background: #da190b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="tabby-logo">🛍️ Tabby</div>
                        <h2>Buy Now, Pay Later</h2>
                        <p>Payment Simulator</p>
                    </div>
                    
                    <div class="amount">${session.amount} ${session.currency}</div>
                    
                    <div class="installment-info">
                        <h3>Payment Plan</h3>
                        <p>💰 4 equal payments of <strong>${installmentAmount} ${session.currency}</strong></p>
                        <p>📅 Payment every 30 days</p>
                        <p>🎯 0% interest, no fees</p>
                    </div>
                    
                    <div class="otp-display">
                        <p>Verification Code:</p>
                        <div class="otp-code">${session.otp}</div>
                    </div>
                    
                    <p class="info">In a real Tabby transaction, you would need to verify your identity. For simulation purposes, the verification code is displayed here.</p>
                    
                    <button class="btn" id="tabbyApproveBtn">✅ Approve Installment Plan</button>
                    <button class="btn cancel-btn" id="tabbyRejectBtn">❌ Cancel</button>
                    
                    <p class="info">This is a simulation environment. No real charges will be made.</p>
                </div>

                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        document.getElementById('tabbyApproveBtn').addEventListener('click', approvePayment);
                        document.getElementById('tabbyRejectBtn').addEventListener('click', rejectPayment);
                    });
                    
                    function approvePayment() {
                        fetch('/verify/approve/${sessionId}', { method: 'POST' })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success && data.returnUrl) {
                                    window.location.href = data.returnUrl + '?status=approved&session_id=${sessionId}';
                                } else {
                                    alert('Installment plan approved! You can close this window.');
                                }
                            })
                            .catch(err => alert('Installment plan approved! You can close this window.'));
                    }
                    
                    function rejectPayment() {
                        const returnUrl = '${session.returnUrl || '/'}';
                        window.location.href = returnUrl + '?status=cancelled&session_id=${sessionId}';
                    }
                </script>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        res.status(500).send('Error loading verification page');
    }
});

// Approve payment endpoint
router.post('/approve/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = approveSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            message: 'Payment approved',
            sessionId,
            returnUrl: session.returnUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to approve payment'
        });
    }
});

module.exports = router;
