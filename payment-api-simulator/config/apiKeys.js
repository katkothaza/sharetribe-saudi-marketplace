// API Keys for different payment methods (mutable for demo purposes)
let API_KEYS = {
    CREDIT_CARD: {
        key: 'cc_sim_pk_test_5f3a2b1c4d5e6f7g8h9i0j1k',
        name: 'Credit Card Simulator'
    },
    STC_PAY: {
        key: 'stc_sim_pk_test_9k1j0i9h8g7f6e5d4c3b2a1f',
        name: 'STC Pay Simulator'
    },
    TABBY: {
        key: 'tby_sim_pk_test_1a2b3c4d5e6f7g8h9i0j1k2l',
        name: 'Tabby Simulator'
    }
};

// Function to get current valid API keys
const getValidApiKeys = () => [
    API_KEYS.CREDIT_CARD.key,
    API_KEYS.STC_PAY.key,
    API_KEYS.TABBY.key
];

// Valid API keys list for quick lookup (for backward compatibility)
const VALID_API_KEYS = getValidApiKeys();

// Function to get payment method by API key
const getPaymentMethodByApiKey = (apiKey) => {
    for (const [method, config] of Object.entries(API_KEYS)) {
        if (config.key === apiKey) {
            return {
                method: method.toLowerCase().replace('_', ''),
                name: config.name
            };
        }
    }
    return null;
};

module.exports = {
    API_KEYS,
    VALID_API_KEYS,
    getValidApiKeys,
    getPaymentMethodByApiKey
};
