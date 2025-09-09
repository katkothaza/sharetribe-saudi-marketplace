const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const creditCardRoutes = require('./routes/creditCard');
const stcPayRoutes = require('./routes/stcPay');
const tabbyRoutes = require('./routes/tabby');
const verificationRoutes = require('./routes/verification');
const adminRoutes = require('./routes/admin');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use('/verify', helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"]
        }
    }
}));
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for verification pages
app.use('/static', express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Payment API Simulator is running',
        timestamp: new Date().toISOString()
    });
});

// API routes with authentication middleware
app.use('/api/v1/creditcard', authMiddleware, creditCardRoutes);
app.use('/api/v1/stcpay', authMiddleware, stcPayRoutes);
app.use('/api/v1/tabby', authMiddleware, tabbyRoutes);

// Verification routes (no auth required for user-facing pages)
app.use('/verify', verificationRoutes);

// Admin routes (no auth required for demo purposes)
app.use('/admin', adminRoutes);

// Default route - Landing page
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment API Simulator</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                padding: 40px;
                text-align: center;
                max-width: 600px;
                width: 100%;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 2.5em;
            }
            .subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 1.2em;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .feature {
                padding: 20px;
                background: #f8f9ff;
                border-radius: 8px;
                border: 1px solid #e1e5fe;
            }
            .feature-icon {
                font-size: 2em;
                margin-bottom: 10px;
            }
            .feature-title {
                font-weight: 600;
                color: #333;
                margin-bottom: 5px;
            }
            .feature-desc {
                color: #666;
                font-size: 0.9em;
            }
            .admin-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-size: 1.1em;
                font-weight: 600;
                cursor: pointer;
                margin: 20px 10px;
                text-decoration: none;
                display: inline-block;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .admin-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            .docs-btn {
                background: white;
                color: #667eea;
                border: 2px solid #667eea;
                padding: 13px 28px;
                border-radius: 8px;
                font-size: 1.1em;
                font-weight: 600;
                cursor: pointer;
                margin: 20px 10px;
                text-decoration: none;
                display: inline-block;
                transition: all 0.2s;
            }
            .docs-btn:hover {
                background: #667eea;
                color: white;
            }
            .endpoints {
                margin-top: 30px;
                padding: 20px;
                background: #f8f9ff;
                border-radius: 8px;
                text-align: left;
            }
            .endpoints h3 {
                color: #333;
                margin-bottom: 15px;
                text-align: center;
            }
            .endpoint {
                margin: 8px 0;
                font-family: 'Courier New', monospace;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Payment API Simulator</h1>
            <p class="subtitle">Test Saudi payment methods with realistic API responses</p>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">💳</div>
                    <div class="feature-title">Credit Cards</div>
                    <div class="feature-desc">Standard payment processing with validation</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <div class="feature-title">STC Pay</div>
                    <div class="feature-desc">Saudi mobile wallet simulation</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🛍️</div>
                    <div class="feature-title">Tabby</div>
                    <div class="feature-desc">Buy now, pay later installments</div>
                </div>
            </div>
            
            <div>
                <a href="/admin" class="admin-btn">🔐 Admin Dashboard</a>
                <a href="https://github.com" class="docs-btn">📖 Documentation</a>
            </div>
            
            <div class="endpoints">
                <h3>Available Endpoints</h3>
                <div class="endpoint">POST /api/v1/creditcard/payment-intent</div>
                <div class="endpoint">POST /api/v1/stcpay/payment</div>
                <div class="endpoint">POST /api/v1/tabby/checkout</div>
                <div class="endpoint">GET  /health - Health check</div>
                <div class="endpoint">GET  /admin - API key management</div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(html);
});

// JSON API endpoint for programmatic access
app.get('/api', (req, res) => {
    res.json({
        message: 'Payment API Simulator',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            admin: '/admin',
            creditCard: '/api/v1/creditcard',
            stcPay: '/api/v1/stcpay',
            tabby: '/api/v1/tabby',
            verification: '/verify'
        }
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.method} ${req.path} does not exist`
    });
});

app.listen(PORT, () => {
    console.log(`Payment API Simulator running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
