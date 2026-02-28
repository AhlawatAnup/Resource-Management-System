// ui.js

export function renderResourcesPage(student, verificationStatus, onSubmitHandler, initializeDatePicker) {
    const isVerified = student.teacher_verified && student.admin_verified;

    const requestContent = document.getElementById('request-content');
    if (!requestContent) return;

    if (isVerified) {
        requestContent.innerHTML = `
            <div class="resources-page">
                <div class="verification-notice verified">
                    <div class="notice-content">
                        <i class="fas fa-check-circle"></i>
                        <span>Welcome! You are verified and eligible to request resources</span>
                    </div>
                </div>
                
                <div class="resource-request-section">
                    <h2>
                        <i class="fas fa-plus-circle"></i>
                        Request Compute Resources
                    </h2>
                    
                    <div class="info-box tip" style="margin-bottom: 20px;">
                        <p class="tip-content" style="margin: 0;">
                            <i class="fas fa-info-circle"></i>
                            <strong>Note:</strong> Only one pending request is allowed at a time. Please wait for your current request to be processed before submitting a new one or delete the request if there are no actions taken by teacher/admin.
                        </p>
                    </div>
                    
                    <form id="resource-request-form">
                        <div class="form-group">
                            <label for="title">Request Title:</label>
                            <input type="text" id="title" class="form-control" placeholder="e.g., Machine Learning Training Project" required>
                        </div>
                        <div class="form-group">
                            <label for="username">Desired VM Username:</label>
                            <input type="text" id="username" class="form-control" placeholder="e.g., your_preferred_username" required>
                            <p style="color: #666; font-size: 0.85em;">Enter a username that will be assigned to your VM if approved. </p>
                            <small style="color: #666; font-size: 0.85em;">Note: Username can contain only letters, numbers, hyphens (-), and underscores (_); no spaces or other special characters are allowed. </small>
                        </div>
                        
                        <div class="form-group">
                            <label for="purpose">Purpose/Description:</label>
                            <textarea id="purpose" class="form-control textarea" rows="4" placeholder="Please describe the purpose of your resource request and what you plan to accomplish..." required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="expiry-date">Required Until (Expiry Date):</label>
                            <input type="text" id="expiry-date" class="form-control" placeholder="Select date" required>
                            <small style="color: #666; font-size: 0.85em;">Maximum 30 days</small>
                        </div>
                        
                        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin: 0 0 15px 0; color: #333; font-size: 1.1em;">
                                <i class="fas fa-cube"></i> GPU Requirements
                            </h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">                                   
                                <div class="form-group">
                                    <label for="gpu-ram">GPU RAM per GPU (GB):</label>
                                    <input type="number" id="gpu-ram" class="form-control" min="0" max="20" placeholder="e.g., 12" required>
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-paper-plane"></i>
                            Submit Resource Request
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Initialize date picker
        initializeDatePicker();

        // Attach submit handler
        const form = document.getElementById('resource-request-form');
        if (form) {
            form.addEventListener('submit', onSubmitHandler);
        }

    } else {
        requestContent.innerHTML = `
            <div class="resources-page">
                <div class="verification-notice pending">
                    <div class="notice-content">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>Verification Required</span>
                    </div>
                    <p>Your verification status: ${verificationStatus}</p>
                </div>
                
                <div class="verification-info">
                    <h2>
                        <i class="fas fa-info-circle"></i>
                        Resource Request Information
                    </h2>
                    
                    <div class="info-box warning">
                        <h3>Verification Process</h3>
                        <p>To request resources, you need to complete the verification process:</p>
                        <ol>
                            <li>Your teacher needs to review and approve your profile</li>
                            <li>An admin needs to provide final verification</li>
                            <li>Once verified, you can request resources from the system</li>
                        </ol>
                        <p><strong>Current Status:</strong> ${verificationStatus}</p>
                    </div>
                    
                    <div class="info-box tip">
                        <p class="tip-content">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Tip:</strong> Contact your assigned teacher or admin if you have questions about the verification process.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Date picker initializer (kept UI-side since it's DOM dependent)
export function initializeExpiryDatePicker() {
    const expiryDateInput = document.getElementById('expiry-date');
    if (!expiryDateInput || typeof flatpickr === 'undefined') {
        return;
    }

    const today = new Date();
    const formatDateInput = (date) => date.toISOString().split('T')[0];

    const defaultDate = new Date();
    defaultDate.setDate(today.getDate() + 7);

    const minDate = new Date();
    minDate.setDate(today.getDate() + 1);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    flatpickr(expiryDateInput, {
        mode: 'single',
        dateFormat: 'Y-m-d',
        defaultDate: formatDateInput(defaultDate),
        minDate: formatDateInput(minDate),
        maxDate: formatDateInput(maxDate),
        enableTime: false,
    });
}

// Notifications (UI only)
export function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff4d4f, #ff7875);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
        z-index: 1000;
        font-weight: 600;
    `;
    notification.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

export function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        font-weight: 600;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i>${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}