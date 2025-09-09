# Payment API Simulator

A comprehensive payment method API simulator for Saudi payment methods including Credit Cards, STC Pay, and Tabby. This simulator provides the same API request/response syntax as real payment gateways while displaying OTP codes for verification instead of sending them.

## 🚀 Features

- **Multiple Payment Methods**: Credit Cards, STC Pay, and Tabby
- **Unique API Keys**: Each payment method has its own API key
- **Input Validation**: Comprehensive validation for all payment parameters
- **OTP Simulation**: Visual display of OTP codes instead of SMS delivery
- **Real API Format**: Responses match the format of actual payment gateways
- **Saudi-specific Validation**: Mobile number validation for Saudi Arabia
- **Interactive Verification Pages**: User-friendly verification interfaces

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone/Download the project**
   ```bash
   git clone <repository-url>
   cd payment-api-simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Access the API**
   - Server runs on: `http://localhost:3000`
   - Health check: `http://localhost:3000/health`

## 🔑 API Keys

Each payment method requires its unique API key:

| Payment Method | API Key |
|----------------|---------|
| Credit Cards   | `cc_sim_pk_test_5f3a2b1c4d5e6f7g8h9i0j1k` |
| STC Pay        | `stc_sim_pk_test_9k1j0i9h8g7f6e5d4c3b2a1f` |
| Tabby          | `tby_sim_pk_test_1a2b3c4d5e6f7g8h9i0j1k2l` |

### Authentication Methods

You can provide the API key using any of these methods:

1. **Authorization Header**
   ```
   Authorization: Bearer your-api-key
   ```

2. **X-API-Key Header**
   ```
   X-API-Key: your-api-key
   ```

3. **Query Parameter**
   ```
   ?api_key=your-api-key
   ```

## 🏦 Credit Card API

### Create Payment Intent
**POST** `/api/v1/creditcard/payment-intent`

```json
{
  "card_number": "4111111111111111",
  "expiry_date": "12/25",
  "cvv": "123",
  "cardholder_name": "John Doe",
  "amount": 100.00,
  "currency": "SAR",
  "return_url": "https://yourapp.com/callback"
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "uuid-here",
  "status": "requires_action",
  "amount": 100.00,
  "currency": "SAR",
  "client_secret": "pi_xxx_secret_xxx",
  "next_action": {
    "type": "redirect_to_url",
    "redirect_to_url": {
      "url": "http://localhost:3000/verify/creditcard/session-id",
      "return_url": "https://yourapp.com/callback"
    }
  }
}
```

### Other Credit Card Endpoints
- `GET /api/v1/creditcard/payment/{paymentId}` - Get payment status
- `POST /api/v1/creditcard/callback` - Payment callback
- `POST /api/v1/creditcard/refund` - Process refund

## 📱 STC Pay API

### Create Payment
**POST** `/api/v1/stcpay/payment`

```json
{
  "mobile_number": "0512345678",
  "amount": 150.00,
  "currency": "SAR",
  "order_reference": "ORDER-123",
  "return_url": "https://yourapp.com/callback"
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "uuid-here",
  "transaction_reference": "STC1234567890",
  "status": "pending_otp",
  "amount": 150.00,
  "currency": "SAR",
  "mobile_number": "+966512345678",
  "otp_required": true,
  "next_action": {
    "type": "redirect_to_url",
    "redirect_to_url": {
      "url": "http://localhost:3000/verify/stcpay/session-id",
      "return_url": "https://yourapp.com/callback"
    }
  },
  "expires_at": "2023-12-31T15:30:00.000Z"
}
```

### Mobile Number Formats
Supports these Saudi mobile number formats:
- `05XXXXXXXX`
- `+966 5XXXXXXXX`
- `966 5XXXXXXXX`

### Other STC Pay Endpoints
- `POST /api/v1/stcpay/verify-otp` - Verify OTP
- `GET /api/v1/stcpay/payment/{paymentId}` - Get payment status
- `POST /api/v1/stcpay/callback` - Payment callback
- `POST /api/v1/stcpay/refund` - Process refund

## 🛒 Tabby API (Buy Now, Pay Later)

### Create Checkout
**POST** `/api/v1/tabby/checkout`

```json
{
  "amount": 400.00,
  "currency": "SAR",
  "buyer": {
    "name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "phone": "+966512345678",
    "dob": "1990-01-01"
  },
  "shipping_address": {
    "city": "Riyadh",
    "address_line_1": "123 King Fahd Road",
    "zip": "12345"
  },
  "order": {
    "items": [
      {
        "title": "Smartphone",
        "unit_price": 400.00,
        "quantity": 1
      }
    ]
  },
  "merchant_urls": {
    "success": "https://yourapp.com/success",
    "cancel": "https://yourapp.com/cancel",
    "failure": "https://yourapp.com/failure"
  }
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "uuid-here",
  "status": "created",
  "amount": 400.00,
  "currency": "SAR",
  "installments_count": 4,
  "installment_amount": 100.00,
  "configuration": {
    "id": "conf_1234567890",
    "available_products": {
      "installments": [{
        "type": "monthly",
        "count": 4,
        "web_url": "http://localhost:3000/verify/tabby/session-id"
      }]
    }
  }
}
```

### Other Tabby Endpoints
- `POST /api/v1/tabby/capture` - Capture payment
- `GET /api/v1/tabby/payment/{paymentId}` - Get payment status
- `POST /api/v1/tabby/callback` - Payment callback
- `POST /api/v1/tabby/refund` - Process refund
- `POST /api/v1/tabby/close` - Close payment

## 🔐 Verification Flow

1. **Create Payment**: Make a payment request to the appropriate endpoint
2. **Get Redirect URL**: The response includes a verification URL
3. **User Verification**: Redirect user to the verification page
4. **OTP Display**: User sees the OTP code on the verification page
5. **Approval**: User clicks "Approve" to complete the payment
6. **Callback**: User is redirected back to your app with the result

### Verification URLs
- Credit Card: `/verify/creditcard/{sessionId}`
- STC Pay: `/verify/stcpay/{sessionId}`
- Tabby: `/verify/tabby/{sessionId}`

## ⚡ Quick Test

Test the API using curl:

```bash
# Credit Card Payment
curl -X POST http://localhost:3000/api/v1/creditcard/payment-intent \
  -H "X-API-Key: cc_sim_pk_test_5f3a2b1c4d5e6f7g8h9i0j1k" \
  -H "Content-Type: application/json" \
  -d '{
    "card_number": "4111111111111111",
    "expiry_date": "12/25",
    "cvv": "123",
    "cardholder_name": "John Doe",
    "amount": 100.00,
    "currency": "SAR"
  }'
```

## 🚨 Error Responses

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Card number is required",
    "Invalid CVV format"
  ]
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found
- `500` - Internal Server Error

## 🔍 Validation Rules

### Credit Cards
- Valid credit card number (Luhn algorithm)
- Expiry date in MM/YY or MM/YYYY format
- CVV: 3 or 4 digits
- Cardholder name: minimum 2 characters
- Amount: positive number
- Currency: SAR, USD, EUR

### STC Pay
- Saudi mobile number format
- Amount: 1 - 50,000 SAR
- Currency: SAR only
- Order reference: minimum 3 characters

### Tabby
- Amount: 50 - 50,000 SAR/AED
- Currency: SAR or AED
- Buyer age: minimum 18 years
- Valid email format
- Complete shipping address
- At least one order item

## 🏗️ Project Structure

```
payment-api-simulator/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── config/
│   ├── apiKeys.js         # API key configurations
│   └── store.js           # In-memory session store
├── middleware/
│   ├── auth.js            # Authentication middleware
│   └── errorHandler.js    # Error handling middleware
├── routes/
│   ├── creditCard.js      # Credit card endpoints
│   ├── stcPay.js          # STC Pay endpoints
│   ├── tabby.js           # Tabby endpoints
│   └── verification.js    # Verification pages
└── public/                # Static files (if needed)
```

## 🔧 Development

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## ⚠️ Important Notes

1. **Simulation Only**: This is for development/testing purposes only
2. **No Real Charges**: No actual money transactions occur
3. **In-Memory Storage**: Session data is stored in memory and will be lost on restart
4. **Security**: For production use, implement proper security measures
5. **Rate Limiting**: Consider adding rate limiting for production environments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Happy Testing! 🎉**
