# Saudi Payments Integration Testing Guide

This guide will help you test the Saudi payment methods integration with your Sharetribe marketplace.

## Prerequisites

✅ **Already Complete:**
- Fresh Sharetribe web template cloned
- GitHub repository created at: `https://github.com/katkothaza/sharetribe-saudi-marketplace`
- Environment variables configured with Sharetribe & Mapbox credentials
- SaudiPaySim server running on port 3000
- Saudi payment API keys retrieved and configured

## Testing Steps

### 1. Install Dependencies & Start Application

```bash
# Install Node.js dependencies
npm install
# or 
yarn install

# Start the development server (this will use port 3001 since SaudiPaySim is on 3000)
npm run dev
# or
yarn run dev
```

### 2. Verify SaudiPaySim Server

Ensure the payment simulator is running:
```bash
# In a separate terminal, navigate to payment-api-simulator
cd payment-api-simulator

# Start the server (if not already running)
npm start
```

Visit: `http://localhost:3000/admin` to verify API keys are active.

### 3. Test Integration Points

#### A. Component Integration
The Saudi payment form needs to be integrated into the checkout flow. You'll need to:

1. **Import the component** in the main checkout page:
   ```js
   import SaudiPaymentForm from '../../components/SaudiPaymentForm/SaudiPaymentForm';
   import { shouldUseSaudiPayments, shouldDisableStripe } from '../../config/configSaudiPayments';
   ```

2. **Conditional rendering** in checkout:
   ```js
   // Replace StripePaymentForm with conditional rendering
   {shouldUseSaudiPayments() ? (
     <SaudiPaymentForm
       // ... pass required props
     />
   ) : !shouldDisableStripe() ? (
     <StripePaymentForm
       // ... original Stripe props
     />
   ) : null}
   ```

#### B. Test Payment Methods

1. **Credit Card Testing:**
   - Use test card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVC: `123`

2. **STC Pay Testing:**
   - Use phone: `+966 50 123 4567`
   - Any valid name and email

3. **Tabby Testing:**
   - Select installment plan (4, 6, or 12 months)
   - Use valid Saudi phone number
   - Valid name and email

### 4. Integration Requirements

You'll need to complete these integration steps:

#### A. Add Component Exports
Add to `src/components/index.js`:
```js
export { default as SaudiPaymentForm } from './SaudiPaymentForm/SaudiPaymentForm';
```

#### B. Modify Checkout Page
Update `src/containers/CheckoutPage/CheckoutPageWithPayment.js` to conditionally use Saudi payments.

#### C. Add Translation Keys
Add these message keys to your translation files:

```js
// Saudi Payment Form messages
'SaudiPaymentForm.selectPaymentMethod': 'Select Payment Method',
'SaudiPaymentForm.submitPayment': 'Pay {totalPrice}',
'SaudiPaymentForm.processing': 'Processing...',
'SaudiPaymentForm.securePaymentInfo': 'Your payment information is secure and encrypted.',

// Credit Card Form messages  
'SaudiCreditCardForm.cardDetailsHeading': 'Card Details',
'SaudiCreditCardForm.cardNumberLabel': 'Card Number',
'SaudiCreditCardForm.cardNumberRequired': 'Card number is required',
// ... add more as needed

// STC Pay Form messages
'SaudiStcPayForm.stcPayHeading': 'STC Pay Details', 
'SaudiStcPayForm.phoneLabel': 'STC Pay Phone Number',
// ... add more as needed

// Tabby Form messages
'SaudiTabbyForm.tabbyHeading': 'Tabby Installments',
'SaudiTabbyForm.installmentLabel': 'Choose Installment Plan',
// ... add more as needed
```

### 5. Expected Behavior

When everything is working correctly:

1. **Stripe should be hidden** when `REACT_APP_STRIPE_DISABLED=true`
2. **Saudi payment options** should appear in the checkout
3. **Form validation** should work for all payment methods
4. **API calls** should be made to SaudiPaySim server (`http://localhost:3000`)
5. **Successful payments** should complete the checkout flow

### 6. Troubleshooting

#### Common Issues:

1. **Component not found errors:**
   - Ensure all components are properly exported in `index.js`
   - Check import paths

2. **API connection errors:**
   - Verify SaudiPaySim server is running on port 3000
   - Check API keys in `.env` file
   - Confirm CORS is properly configured

3. **Translation errors:**
   - Add missing translation keys
   - Check message ID spelling

4. **Styling issues:**
   - CSS modules may need adjustment
   - Ensure CSS files exist for all components

### 7. Production Considerations

When deploying to production:

1. **Replace test API keys** with production keys from SaudiPaySim
2. **Update base URL** to production SaudiPaySim server
3. **Enable HTTPS** for secure payment processing
4. **Test all payment flows** thoroughly
5. **Set up monitoring** for payment transactions

## Support

- **SaudiPaySim Documentation:** Check payment-api-simulator/README.md
- **Sharetribe Docs:** https://www.sharetribe.com/docs/
- **GitHub Repository:** https://github.com/katkothaza/sharetribe-saudi-marketplace

## API Keys Reference

Current test API keys configured:
- **Credit Card:** `cc_sim_pk_test_5f3a2b1c4d5e6f7g8h9i0j1k`
- **STC Pay:** `stc_sim_pk_test_9k1j0i9h8g7f6e5d4c3b2a1f` 
- **Tabby:** `tby_sim_pk_test_1a2b3c4d5e6f7g8h9i0j1k2l`

These can be regenerated from the SaudiPaySim admin panel at `http://localhost:3000/admin`.
