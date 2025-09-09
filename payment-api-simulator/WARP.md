# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
This is a Payment API Simulator for Saudi payment methods (Credit Cards, STC Pay, and Tabby). It provides realistic API request/response syntax matching real payment gateways while displaying OTP codes visually instead of sending SMS.

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Development server with auto-reload
npm run dev

# Production server
npm start

# Health check (server must be running)
curl http://localhost:3000/health
```

### Testing the API
```bash
# Test Credit Card payment
curl -X POST http://localhost:3000/api/v1/creditcard/payment-intent \
  -H "X-API-Key: cc_sim_pk_test_5f3a2b1c4d5e6f7g8h9i0j1k" \
  -H "Content-Type: application/json" \
  -d '{"card_number":"4111111111111111","expiry_date":"12/25","cvv":"123","cardholder_name":"John Doe","amount":100.00,"currency":"SAR"}'

# Test STC Pay payment
curl -X POST http://localhost:3000/api/v1/stcpay/payment \
  -H "X-API-Key: stc_sim_pk_test_9k1j0i9h8g7f6e5d4c3b2a1f" \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"0512345678","amount":150.00,"currency":"SAR","order_reference":"ORDER-123"}'

# Test Tabby payment
curl -X POST http://localhost:3000/api/v1/tabby/checkout \
  -H "X-API-Key: tby_sim_pk_test_1a2b3c4d5e6f7g8h9i0j1k2l" \
  -H "Content-Type: application/json" \
  -d '{"amount":400.00,"currency":"SAR","buyer":{"name":"Ahmed Ali","email":"ahmed@example.com","phone":"+966512345678","dob":"1990-01-01"},"shipping_address":{"city":"Riyadh","address_line_1":"123 King Fahd Road","zip":"12345"},"order":{"items":[{"title":"Smartphone","unit_price":400.00,"quantity":1}]}}'
```

## Architecture Overview

### Core Components Structure
- **Express.js Server** (`server.js`) - Main application entry point with middleware setup
- **Route-based Payment Methods** - Each payment method (Credit Card, STC Pay, Tabby) has dedicated route handlers
- **Authentication Middleware** - Validates API keys across multiple methods (Bearer token, X-API-Key header, query parameter)
- **Session Management** - In-memory store for payment verification sessions
- **Interactive Verification Pages** - HTML pages that simulate payment gateway UIs

### Authentication Architecture
The system uses a flexible API key authentication system:
- Each payment method has a unique API key stored in `config/apiKeys.js`
- Keys can be provided via Authorization header, X-API-Key header, or query parameter
- The auth middleware (`middleware/auth.js`) validates keys and attaches payment method info to requests

### Payment Flow Architecture
1. **Payment Initiation** - API call creates payment session with validation
2. **Session Creation** - Session stored in memory with generated OTP code
3. **User Verification** - Redirect to payment method-specific verification page
4. **OTP Display** - Visual OTP presentation (simulation of SMS/mobile notification)
5. **Approval/Rejection** - User action triggers status update and callback

### Data Storage
- **In-Memory Sessions** (`config/store.js`) - Temporary payment session storage
- **No Persistence** - All data is lost on server restart (intentional for simulation)
- **Dynamic API Key Management** - API keys can be updated via admin interface

## Key Implementation Details

### Validation Patterns
- **Credit Cards**: Luhn algorithm validation, expiry date checking, CVV format
- **STC Pay**: Saudi mobile number formats (+966, 966, 05XXXXXXXX), amount limits (1-50,000 SAR)
- **Tabby**: Age verification (18+), installment calculations, comprehensive buyer data validation

### API Response Structure
All endpoints follow consistent response patterns:
```javascript
// Success Response
{
  "success": true,
  "payment_id": "uuid",
  "status": "requires_action|succeeded|pending_otp",
  "next_action": {
    "type": "redirect_to_url",
    "redirect_to_url": {
      "url": "verification_url",
      "return_url": "callback_url"
    }
  }
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "details": ["validation error 1", "validation error 2"]
}
```

### Session Management Logic
- Sessions are identified by method-specific IDs: `{method}_{timestamp}_{random}`
- Each session contains: `id`, `method`, `amount`, `currency`, `returnUrl`, `otp`, `status`, `createdAt`
- OTP codes are 6-digit random numbers generated per session

## Payment Method Specifics

### Credit Card (`/api/v1/creditcard`)
- Supports multiple currencies (SAR, USD, EUR)
- Card validation using validator.js library
- Expiry date format: MM/YY or MM/YYYY
- CVV: 3-4 digits required

### STC Pay (`/api/v1/stcpay`)
- Saudi Arabia only (SAR currency)
- Mobile number normalization to +966 format
- Transaction limits: 1-50,000 SAR
- 15-minute OTP expiration

### Tabby (`/api/v1/tabby`)
- Buy Now, Pay Later functionality
- Supports SAR and AED currencies
- 4-installment payment plans
- Comprehensive buyer eligibility checking
- Minimum transaction: 50 SAR/AED

## API Keys (Simulation Environment)
```
Credit Cards: cc_sim_pk_test_5f3a2b1c4d5e6f7g8h9i0j1k
STC Pay:      stc_sim_pk_test_9k1j0i9h8g7f6e5d4c3b2a1f
Tabby:        tby_sim_pk_test_1a2b3c4d5e6f7g8h9i0j1k2l
```

## Development Guidelines

### Adding New Payment Methods
1. Create new route file in `routes/` directory
2. Add API key to `config/apiKeys.js`
3. Include route in `server.js` with auth middleware
4. Create verification page template in `routes/verification.js`
5. Update admin dashboard for key management

### Error Handling
- Use `middleware/errorHandler.js` for consistent error responses
- Validation errors should return 400 with detailed error arrays
- Authentication errors return 401 with clear messaging
- Server errors return 500 with minimal exposure in production

### Session Testing
Since sessions are in-memory, they persist only during server runtime. For testing payment flows:
1. Make payment API call
2. Extract verification URL from response
3. Visit URL in browser to see OTP simulation
4. Use approval/rejection buttons for flow completion

## Important Constraints
- **Simulation Only** - No real financial transactions occur
- **In-Memory Storage** - All session data lost on restart
- **Development Environment** - Not suitable for production use without modifications
- **Saudi Market Focus** - Validation rules and formats specific to Saudi Arabia
