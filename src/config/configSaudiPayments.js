/* Saudi Payment Methods (SaudiPaySim) related configuration.

NOTE: Saudi payment API keys are set in .env file:
- REACT_APP_CREDIT_CARD_API_KEY
- REACT_APP_STC_PAY_API_KEY 
- REACT_APP_TABBY_API_KEY

This configuration allows switching between test and production modes
and provides Saudi market specific payment method settings.
*/

// Saudi payment method types
export const PAYMENT_TYPES = {
  CREDIT_CARD: 'CREDIT_CARD',
  STC_PAY: 'STC_PAY', 
  TABBY: 'TABBY'
};

// Check if Saudi payments are enabled
export const saudiPaymentsEnabled = process.env.REACT_APP_SAUDI_PAYMENTS_ENABLED === 'true';

// Saudi payment API configuration
export const saudiPaymentsConfig = {
  baseUrl: process.env.REACT_APP_SAUDI_PAYMENTS_BASE_URL || 'http://localhost:3000',
  apiKeys: {
    creditCard: process.env.REACT_APP_CREDIT_CARD_API_KEY,
    stcPay: process.env.REACT_APP_STC_PAY_API_KEY,
    tabby: process.env.REACT_APP_TABBY_API_KEY,
  },
};

// Check if Stripe is disabled for Saudi market
export const stripeDisabled = process.env.REACT_APP_STRIPE_DISABLED === 'true';

// Saudi payment methods with display information
export const paymentMethods = [
  {
    id: PAYMENT_TYPES.CREDIT_CARD,
    name: 'Credit Card',
    nameArabic: 'بطاقة ائتمانية', 
    description: 'Pay securely with your Visa or Mastercard',
    descriptionArabic: 'ادفع بأمان باستخدام فيزا أو ماستركارد',
    icon: 'credit-card',
    enabled: !!saudiPaymentsConfig.apiKeys.creditCard,
    apiKey: saudiPaymentsConfig.apiKeys.creditCard,
  },
  {
    id: PAYMENT_TYPES.STC_PAY,
    name: 'STC Pay',
    nameArabic: 'STC Pay',
    description: 'Pay using your STC Pay digital wallet',
    descriptionArabic: 'ادفع باستخدام محفظة STC Pay الرقمية',
    icon: 'stc-pay',
    enabled: !!saudiPaymentsConfig.apiKeys.stcPay,
    apiKey: saudiPaymentsConfig.apiKeys.stcPay,
  },
  {
    id: PAYMENT_TYPES.TABBY,
    name: 'Tabby',
    nameArabic: 'تابي',
    description: 'Buy now, pay later in 4 interest-free installments',
    descriptionArabic: 'اشتري الآن وادفع لاحقاً على 4 أقساط بدون فوائد',
    icon: 'tabby',
    enabled: !!saudiPaymentsConfig.apiKeys.tabby,
    apiKey: saudiPaymentsConfig.apiKeys.tabby,
  },
];

// Get available payment methods (only enabled ones)
export const getAvailablePaymentMethods = () => {
  return paymentMethods.filter(method => method.enabled);
};

// Get payment method by ID
export const getPaymentMethodById = (id) => {
  return paymentMethods.find(method => method.id === id);
};

// Helper function to determine if we should use Saudi payments
export const shouldUseSaudiPayments = () => {
  return saudiPaymentsEnabled && getAvailablePaymentMethods().length > 0;
};

// Helper function to determine if we should disable Stripe
export const shouldDisableStripe = () => {
  return stripeDisabled || shouldUseSaudiPayments();
};

// API endpoints for different payment methods
export const apiEndpoints = {
  [PAYMENT_TYPES.CREDIT_CARD]: {
    charge: '/api/credit-card/charge',
    validate: '/api/credit-card/validate',
  },
  [PAYMENT_TYPES.STC_PAY]: {
    charge: '/api/stc-pay/charge', 
    validate: '/api/stc-pay/validate',
  },
  [PAYMENT_TYPES.TABBY]: {
    charge: '/api/tabby/charge',
    validate: '/api/tabby/validate',
    installments: '/api/tabby/installments',
  },
};

// Default currency for Saudi market
export const defaultCurrency = 'SAR';

// Supported currencies in Saudi market
export const supportedCurrencies = ['SAR', 'USD'];
