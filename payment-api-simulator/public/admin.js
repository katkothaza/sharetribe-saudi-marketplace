// Admin Dashboard JavaScript

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Copy button event listeners
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            copyToClipboard(target);
        });
    });
    
    // Edit button event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            openEditModal(method);
        });
    });
    
    // Regenerate button event listeners
    document.querySelectorAll('.regenerate-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            regenerateKey(method);
        });
    });
    
    // Test button event listeners
    document.querySelectorAll('.test-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            testEndpoint(method);
        });
    });
    
    // Cancel button event listener
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking the X
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // Edit form submission
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const methodId = document.getElementById('methodId').value;
            const newKey = document.getElementById('apiKeyInput').value;
            if (methodId && newKey) {
                updateApiKey(methodId, newKey);
            }
        });
    }
}

// Copy to clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showAlert('API key copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showAlert('API key copied to clipboard!', 'success');
    });
}

// Show alert function
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = 'alert ' + type;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

// Open edit modal
function openEditModal(methodId) {
    const modal = document.getElementById('editModal');
    const methodName = document.getElementById('methodName');
    const methodIdField = document.getElementById('methodId');
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    const methodNames = {
        'CREDIT_CARD': 'Credit Cards',
        'STC_PAY': 'STC Pay',
        'TABBY': 'Tabby'
    };
    
    // Get the current key from the displayed key element
    const keyElementMap = {
        'CREDIT_CARD': 'cc-key',
        'STC_PAY': 'stc-key',
        'TABBY': 'tabby-key'
    };
    
    const currentKey = document.getElementById(keyElementMap[methodId]).textContent;
    
    methodName.value = methodNames[methodId];
    methodIdField.value = methodId;
    apiKeyInput.value = currentKey;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

// Update API key function
function updateApiKey(methodId, newKey) {
    fetch('/admin/api-keys', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            method: methodId,
            apiKey: newKey
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the display
            const keyElementMap = {
                'CREDIT_CARD': 'cc-key',
                'STC_PAY': 'stc-key',
                'TABBY': 'tabby-key'
            };
            
            // Update the displayed key
            document.getElementById(keyElementMap[methodId]).textContent = newKey;
            showAlert('API key updated successfully!', 'success');
            closeModal();
        } else {
            showAlert('Failed to update API key: ' + data.error, 'error');
        }
    })
    .catch(error => {
        showAlert('Error updating API key: ' + error.message, 'error');
    });
}

// Regenerate API key
function regenerateKey(methodId) {
    if (!confirm('Are you sure you want to regenerate this API key? This will invalidate the current key.')) {
        return;
    }
    
    fetch('/admin/api-keys/regenerate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            method: methodId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const keyElementMap = {
                'CREDIT_CARD': 'cc-key',
                'STC_PAY': 'stc-key',
                'TABBY': 'tabby-key'
            };
            
            // Update the displayed key
            document.getElementById(keyElementMap[methodId]).textContent = data.newKey;
            showAlert('API key regenerated successfully!', 'success');
        } else {
            showAlert('Failed to regenerate API key: ' + data.error, 'error');
        }
    })
    .catch(error => {
        showAlert('Error regenerating API key: ' + error.message, 'error');
    });
}

// Test endpoint function
function testEndpoint(method) {
    const keyMap = {
        'creditcard': document.getElementById('cc-key').textContent,
        'stcpay': document.getElementById('stc-key').textContent,
        'tabby': document.getElementById('tabby-key').textContent
    };
    
    const testData = {
        'creditcard': {
            url: '/api/v1/creditcard/payment-intent',
            data: {
                card_number: '4111111111111111',
                expiry_date: '12/25',
                cvv: '123',
                cardholder_name: 'Test User',
                amount: 100.00,
                currency: 'SAR'
            }
        },
        'stcpay': {
            url: '/api/v1/stcpay/payment',
            data: {
                mobile_number: '0512345678',
                amount: 150.00,
                currency: 'SAR',
                order_reference: 'TEST-123'
            }
        },
        'tabby': {
            url: '/api/v1/tabby/checkout',
            data: {
                amount: 400.00,
                currency: 'SAR',
                buyer: {
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '+966512345678',
                    dob: '1990-01-01'
                },
                shipping_address: {
                    city: 'Riyadh',
                    address_line_1: '123 Test Street',
                    zip: '12345'
                },
                order: {
                    items: [{
                        title: 'Test Product',
                        unit_price: 400.00,
                        quantity: 1
                    }]
                }
            }
        }
    };
    
    const apiKey = keyMap[method];
    const testConfig = testData[method];
    
    fetch(testConfig.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
        },
        body: JSON.stringify(testConfig.data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert(method.toUpperCase() + ' API test successful! Check console for full response.', 'success');
            console.log(method.toUpperCase() + ' API Response:', data);
        } else {
            showAlert('API test failed: ' + (data.error || 'Unknown error'), 'error');
            console.error(method.toUpperCase() + ' API Error:', data);
        }
    })
    .catch(error => {
        showAlert('API test error: ' + error.message, 'error');
        console.error(method.toUpperCase() + ' API Error:', error);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle form submission
    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const methodId = document.getElementById('methodId').value;
        const newKey = document.getElementById('apiKeyInput').value.trim();
        
        if (!newKey) {
            showAlert('Please enter a valid API key', 'error');
            return;
        }
        
        // Update API key
        updateApiKey(methodId, newKey);
    });
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeModal();
        }
    }
    
    // Close modal with X button
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }
});
