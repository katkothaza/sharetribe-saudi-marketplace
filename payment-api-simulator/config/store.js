// Simple in-memory store for demo purposes only
// Not suitable for production use

const sessions = new Map();

function createPaymentSession({ method, amount, currency, returnUrl }) {
    const id = `${method}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const session = {
        id,
        method,
        amount,
        currency,
        returnUrl,
        otp,
        status: 'requires_action',
        createdAt: new Date().toISOString()
    };
    sessions.set(id, session);
    return session;
}

function getSession(id) {
    return sessions.get(id);
}

function approveSession(id) {
    const s = sessions.get(id);
    if (!s) return null;
    s.status = 'succeeded';
    s.approvedAt = new Date().toISOString();
    return s;
}

module.exports = {
    createPaymentSession,
    getSession,
    approveSession,
};
