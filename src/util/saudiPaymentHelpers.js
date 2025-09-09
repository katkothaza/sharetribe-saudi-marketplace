/**
 * Utility functions for Saudi payment methods integration with SaudiPaySim
 */

import { saudiPaymentsConfig, apiEndpoints, PAYMENT_TYPES } from '../config/configSaudiPayments';

/**
 * Make an API call to SaudiPaySim server
 * @param {string} endpoint - API endpoint 
 * @param {string} method - HTTP method
 * @param {Object} data - Request data
 * @param {string} apiKey - API key for the payment method
 * @returns {Promise} API response
 */
export const callSaudiPaymentAPI = async (endpoint, method = 'POST', data = {}, apiKey) => {
  if (!apiKey) {
    throw new Error('API key is required for Saudi payment requests');
  }

  const url = `${saudiPaymentsConfig.baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Saudi payment API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Saudi payment API call failed:', error);
    throw error;
  }
};

/**
 * Process a credit card payment
 * @param {Object} paymentData - Payment information
 * @returns {Promise} Payment result
 */
export const processCreditCardPayment = async (paymentData) => {
  const { amount, currency, cardDetails, billingDetails, apiKey } = paymentData;
  
  const requestData = {
    amount,
    currency,
    card: cardDetails,
    billing_details: billingDetails,
  };

  return callSaudiPaymentAPI(
    apiEndpoints[PAYMENT_TYPES.CREDIT_CARD].charge,
    'POST',
    requestData,
    apiKey
  );
};

/**
 * Process an STC Pay payment
 * @param {Object} paymentData - Payment information
 * @returns {Promise} Payment result
 */
export const processStcPayPayment = async (paymentData) => {
  const { amount, currency, phone, billingDetails, apiKey } = paymentData;
  
  const requestData = {
    amount,
    currency,
    phone,
    billing_details: billingDetails,
  };

  return callSaudiPaymentAPI(
    apiEndpoints[PAYMENT_TYPES.STC_PAY].charge,
    'POST',
    requestData,
    apiKey
  );
};

/**
 * Process a Tabby payment (Buy Now Pay Later)
 * @param {Object} paymentData - Payment information
 * @returns {Promise} Payment result
 */
export const processTabbyPayment = async (paymentData) => {
  const { amount, currency, customerDetails, installmentPlan, apiKey } = paymentData;
  
  const requestData = {
    amount,
    currency,
    customer: customerDetails,
    installment_plan: installmentPlan,
  };

  return callSaudiPaymentAPI(
    apiEndpoints[PAYMENT_TYPES.TABBY].charge,
    'POST',
    requestData,
    apiKey
  );
};

/**
 * Validate credit card details
 * @param {Object} cardDetails - Credit card information
 * @param {string} apiKey - API key
 * @returns {Promise} Validation result
 */
export const validateCreditCard = async (cardDetails, apiKey) => {
  return callSaudiPaymentAPI(
    apiEndpoints[PAYMENT_TYPES.CREDIT_CARD].validate,
    'POST',
    { card: cardDetails },
    apiKey
  );
};

/**
 * Validate STC Pay account
 * @param {string} phone - Phone number
 * @param {string} apiKey - API key
 * @returns {Promise} Validation result
 */
export const validateStcPay = async (phone, apiKey) => {
  return callSaudiPaymentAPI(
    apiEndpoints[PAYMENT_TYPES.STC_PAY].validate,
    'POST',
    { phone },
    apiKey
  );
};

/**
 * Get Tabby installment options
 * @param {number} amount - Purchase amount
 * @param {string} currency - Currency code
 * @param {string} apiKey - API key
 * @returns {Promise} Installment options
 */
export const getTabbyInstallments = async (amount, currency, apiKey) => {
  return callSaudiPaymentAPI(
    apiEndpoints[PAYMENT_TYPES.TABBY].installments,
    'POST',
    { amount, currency },
    apiKey
  );
};

/**
 * Format amount for display (SAR currency)
 * @param {number} amount - Amount in smallest currency unit
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export const formatSaudiAmount = (amount, currency = 'SAR') => {
  const value = amount / 100; // Convert from smallest unit
  if (currency === 'SAR') {
    return `${value.toFixed(2)} ر.س`;
  }
  return `${value.toFixed(2)} ${currency}`;
};

/**
 * Convert amount to smallest currency unit
 * @param {number} amount - Amount in main currency unit
 * @returns {number} Amount in smallest unit (halalas for SAR)
 */
export const convertToSmallestUnit = (amount) => {
  return Math.round(amount * 100);
};

/**
 * Get payment method specific error messages
 * @param {string} paymentType - Payment method type
 * @param {string} errorCode - Error code from API
 * @returns {string} User-friendly error message
 */
export const getPaymentErrorMessage = (paymentType, errorCode) => {
  const errorMessages = {
    [PAYMENT_TYPES.CREDIT_CARD]: {
      'insufficient_funds': 'Your card has insufficient funds for this transaction.',
      'card_expired': 'Your card has expired. Please use a valid card.',
      'card_declined': 'Your card was declined. Please try a different payment method.',
      'invalid_card': 'The card details entered are invalid.',
    },
    [PAYMENT_TYPES.STC_PAY]: {
      'insufficient_balance': 'Your STC Pay account has insufficient balance.',
      'invalid_phone': 'The phone number entered is not valid for STC Pay.',
      'account_locked': 'Your STC Pay account is temporarily locked.',
    },
    [PAYMENT_TYPES.TABBY]: {
      'credit_declined': 'Tabby credit application was declined.',
      'installment_failed': 'Unable to setup installment plan.',
      'customer_ineligible': 'You are not eligible for Tabby installments.',
    },
  };

  const methodErrors = errorMessages[paymentType] || {};
  return methodErrors[errorCode] || 'Payment processing failed. Please try again.';
};

/**
 * Check if payment method is available for given amount
 * @param {string} paymentType - Payment method type
 * @param {number} amount - Transaction amount
 * @returns {boolean} Whether payment method is available
 */
export const isPaymentMethodAvailable = (paymentType, amount) => {
  // Minimum amounts (in main currency units)
  const minimumAmounts = {
    [PAYMENT_TYPES.CREDIT_CARD]: 1, // 1 SAR
    [PAYMENT_TYPES.STC_PAY]: 5, // 5 SAR  
    [PAYMENT_TYPES.TABBY]: 100, // 100 SAR for installments
  };

  // Maximum amounts (in main currency units)
  const maximumAmounts = {
    [PAYMENT_TYPES.CREDIT_CARD]: 50000, // 50,000 SAR
    [PAYMENT_TYPES.STC_PAY]: 10000, // 10,000 SAR
    [PAYMENT_TYPES.TABBY]: 5000, // 5,000 SAR
  };

  const min = minimumAmounts[paymentType] || 0;
  const max = maximumAmounts[paymentType] || Infinity;
  
  return amount >= min && amount <= max;
};
