const express = require('express');
const { API_KEYS } = require('../config/apiKeys');

const router = express.Router();

// Admin dashboard - API key management UI
router.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment API Simulator - Admin Dashboard</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .content {
                padding: 30px;
            }
            
            .api-keys-section {
                margin-bottom: 40px;
            }
            
            .section-title {
                font-size: 1.8em;
                color: #333;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #667eea;
            }
            
            .api-key-card {
                background: #f8f9ff;
                border: 1px solid #e1e5fe;
                border-radius: 8px;
                padding: 25px;
                margin-bottom: 20px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .api-key-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .payment-method {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .method-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-size: 18px;
                color: white;
            }
            
            .credit-card { background: #1976d2; }
            .stc-pay { background: #673ab7; }
            .tabby { background: #ff6b35; }
            
            .method-name {
                font-size: 1.3em;
                font-weight: 600;
                color: #333;
            }
            
            .api-key-display {
                background: white;
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 15px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #333;
                position: relative;
                margin: 15px 0;
            }
            
            .copy-btn {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: #667eea;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
            }
            
            .copy-btn:hover {
                background: #5a67d8;
            }
            
            .edit-btn {
                background: #4caf50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                margin-top: 10px;
                transition: background 0.2s;
            }
            
            .edit-btn:hover {
                background: #45a049;
            }
            
            .regenerate-btn {
                background: #ff9800;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                margin-left: 10px;
                transition: background 0.2s;
            }
            
            .regenerate-btn:hover {
                background: #f57c00;
            }
            
            .test-section {
                background: #f0f4f8;
                padding: 25px;
                border-radius: 8px;
                margin-top: 30px;
            }
            
            .test-button {
                background: #10b981;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px 10px 10px 0;
                transition: background 0.2s;
            }
            
            .test-button:hover {
                background: #059669;
            }
            
            .alert {
                padding: 15px;
                border-radius: 6px;
                margin: 15px 0;
                display: none;
            }
            
            .alert.success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            
            .alert.error {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
            }
            
            .modal-content {
                background: white;
                margin: 15% auto;
                padding: 30px;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            
            .modal-header {
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .modal-title {
                font-size: 1.5em;
                color: #333;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
            }
            
            .form-input {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                font-family: 'Courier New', monospace;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
            }
            
            .modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 25px;
            }
            
            .btn-cancel {
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
            }
            
            .btn-save {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
            }
            
            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            
            .close:hover {
                color: #000;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            
            .stat-card {
                background: white;
                border: 1px solid #e1e5fe;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
            }
            
            .stat-number {
                font-size: 2em;
                font-weight: bold;
                color: #667eea;
            }
            
            .stat-label {
                color: #666;
                margin-top: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Payment API Simulator</h1>
                <p>Admin Dashboard - API Key Management</p>
            </div>
            
            <div class="content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">3</div>
                        <div class="stat-label">Payment Methods</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">3</div>
                        <div class="stat-label">Active API Keys</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">🟢</div>
                        <div class="stat-label">Server Status</div>
                    </div>
                </div>
                
                <div class="api-keys-section">
                    <h2 class="section-title">🔑 API Keys</h2>
                    
                    <!-- Credit Card API Key -->
                    <div class="api-key-card">
                        <div class="payment-method">
                            <div class="method-icon credit-card">💳</div>
                            <div class="method-name">Credit Cards</div>
                        </div>
                        <div class="api-key-display">
                            <span id="cc-key">${API_KEYS.CREDIT_CARD.key}</span>
                            <button class="copy-btn" data-target="cc-key">Copy</button>
                        </div>
                        <button class="edit-btn" data-method="CREDIT_CARD" data-key="${API_KEYS.CREDIT_CARD.key}">Edit Key</button>
                        <button class="regenerate-btn" data-method="CREDIT_CARD">Regenerate</button>
                    </div>
                    
                    <!-- STC Pay API Key -->
                    <div class="api-key-card">
                        <div class="payment-method">
                            <div class="method-icon stc-pay">📱</div>
                            <div class="method-name">STC Pay</div>
                        </div>
                        <div class="api-key-display">
                            <span id="stc-key">${API_KEYS.STC_PAY.key}</span>
                            <button class="copy-btn" data-target="stc-key">Copy</button>
                        </div>
                        <button class="edit-btn" data-method="STC_PAY" data-key="${API_KEYS.STC_PAY.key}">Edit Key</button>
                        <button class="regenerate-btn" data-method="STC_PAY">Regenerate</button>
                    </div>
                    
                    <!-- Tabby API Key -->
                    <div class="api-key-card">
                        <div class="payment-method">
                            <div class="method-icon tabby">🛍️</div>
                            <div class="method-name">Tabby</div>
                        </div>
                        <div class="api-key-display">
                            <span id="tabby-key">${API_KEYS.TABBY.key}</span>
                            <button class="copy-btn" data-target="tabby-key">Copy</button>
                        </div>
                        <button class="edit-btn" data-method="TABBY" data-key="${API_KEYS.TABBY.key}">Edit Key</button>
                        <button class="regenerate-btn" data-method="TABBY">Regenerate</button>
                    </div>
                </div>
                
                <div class="test-section">
                    <h3 class="section-title">🧪 API Testing</h3>
                    <p style="margin-bottom: 20px; color: #666;">Test your API endpoints with the current keys:</p>
                    <button class="test-button" data-method="creditcard">Test Credit Card API</button>
                    <button class="test-button" data-method="stcpay">Test STC Pay API</button>
                    <button class="test-button" data-method="tabby">Test Tabby API</button>
                </div>
                
                <div id="alert" class="alert"></div>
            </div>
        </div>
        
        <!-- Edit Modal -->
        <div id="editModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close">&times;</span>
                    <h2 class="modal-title">Edit API Key</h2>
                </div>
                <form id="editForm">
                    <div class="form-group">
                        <label class="form-label">Payment Method:</label>
                        <input type="text" id="methodName" class="form-input" readonly>
                        <input type="hidden" id="methodId">
                    </div>
                    <div class="form-group">
                        <label class="form-label">API Key:</label>
                        <input type="text" id="apiKeyInput" class="form-input" placeholder="Enter new API key">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" id="cancelBtn">Cancel</button>
                        <button type="submit" class="btn-save">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
        
        <script src="/static/admin.js"></script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// Get current API keys (API endpoint)
router.get('/api-keys', (req, res) => {
    res.json({
        success: true,
        apiKeys: API_KEYS
    });
});

// Update API key
router.put('/api-keys', (req, res) => {
    try {
        const { method, apiKey } = req.body;
        
        if (!method || !apiKey) {
            return res.status(400).json({
                success: false,
                error: 'Method and API key are required'
            });
        }
        
        if (!API_KEYS[method]) {
            return res.status(404).json({
                success: false,
                error: 'Payment method not found'
            });
        }
        
        // Update the API key (in a real application, this would persist to a database)
        API_KEYS[method].key = apiKey;
        
        res.json({
            success: true,
            message: 'API key updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Regenerate API key
router.post('/api-keys/regenerate', (req, res) => {
    try {
        const { method } = req.body;
        
        if (!method) {
            return res.status(400).json({
                success: false,
                error: 'Method is required'
            });
        }
        
        if (!API_KEYS[method]) {
            return res.status(404).json({
                success: false,
                error: 'Payment method not found'
            });
        }
        
        // Generate new API key
        const prefixMap = {
            'CREDIT_CARD': 'cc_sim_pk_test_',
            'STC_PAY': 'stc_sim_pk_test_',
            'TABBY': 'tby_sim_pk_test_'
        };
        
        const randomSuffix = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const newKey = prefixMap[method] + randomSuffix;
        
        // Update the API key
        API_KEYS[method].key = newKey;
        
        res.json({
            success: true,
            message: 'API key regenerated successfully',
            newKey: newKey
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
