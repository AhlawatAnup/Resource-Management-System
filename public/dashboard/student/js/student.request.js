// Import common functions
import { formatDate, isValidUsername } from '/dashboard/common/js/commons.js';
import { getLoggedInStudentId, showLoadingState, showErrorMessage } from './student.utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Load the request resources page when DOM is ready
    loadRequestResourcesPage();
});

async function loadRequestResourcesPage() {
    try {
        // Show loading state
        showLoadingState('request-content');
        
        // Get the logged-in student's ID from session/storage
        const studentId = await getLoggedInStudentId();
        
        if (!studentId) {
            throw new Error('Student ID not found. Please login again.');
        }
        
        // Fetch student details from API with student ID
        const response = await fetch(`/dashboard/student/student_data/${studentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch student details');
        }

        const studentData = await response.json();
        displayResourcesPage(studentData);
        
    } catch (error) {
        console.error('Error loading student details for resources:', error);
        showErrorMessage('Failed to load student details. Please try again.', 'request-content');
    }
}

function displayResourcesPage(student) {
    // console.log('Displaying resources page for student:', student);
    
    // Check if student is verified
    const isVerified = student.teacher_verified && student.admin_verified;
    const verificationStatus = getStudentVerificationStatus(student);
    
    // Update the main content area
    const requestContent = document.getElementById('request-content');
    if (requestContent) {
        if (isVerified) {
            // Show welcome message and resource request interface for verified students
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
                                <input type="date" id="expiry-date" class="form-control" required>
                                <small style="color: #666; font-size: 0.85em;">Select the date when you no longer need these resources</small>
                            </div>
                            
                            <!-- 
                            =============================================================================
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;"> 
                                <h4 style="margin: 0 0 15px 0; color: #333; font-size: 1.1em;">
                                    <i class="fas fa-microchip"></i> CPU Requirements
                                </h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                    <div class="form-group">
                                        <label for="cpu-cores">CPU Cores Required:</label>
                                        <input type="number" id="cpu-cores" class="form-control" min="1" max="64" placeholder="e.g., 8" required>
                                        <small style="color: #666; font-size: 0.85em;">Recommended: 4-16 cores for most tasks</small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="cpu-ram">CPU RAM Required (GB):</label>
                                        <input type="number" id="cpu-ram" class="form-control" min="1" max="1024" placeholder="e.g., 16" required>
                                        <small style="color: #666; font-size: 0.85em;">Recommended: 8-32 GB for most tasks</small>
                                    </div>
                                </div>
                            </div>
                            =============================================================================
                            -->
                            
                            <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="margin: 0 0 15px 0; color: #333; font-size: 1.1em;">
                                    <i class="fas fa-cube"></i> GPU Requirements
                                </h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">                                   
                                    <div class="form-group">
                                        <label for="gpu-ram">GPU RAM per GPU (GB):</label>
                                        <input type="number" id="gpu-ram" class="form-control" min="0" max="80" placeholder="e.g., 12" required>
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
            
            // Add form submission handler
            const form = document.getElementById('resource-request-form');
            if (form) {
                form.addEventListener('submit', handleResourceRequest);
            }
            
        } else {
            // Show verification status for non-verified students
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
}

// Function to determine student verification status based on new schema
function getStudentVerificationStatus(student) {
    // console.log('Student verification fields:', {
    //     teacher_verified: student.teacher_verified,
    //     admin_verified: student.admin_verified,
    //     teacher_action: student.teacher_action,
    //     admin_action: student.admin_action,
    //     is_verified: student.is_verified
    // });

    // If both teacher and admin have verified
    if (student.teacher_verified && student.admin_verified) {
        return "✓ Verified";
    }
    
    // If teacher has taken action (approved/rejected) but admin hasn't
    if (student.teacher_action && !student.admin_action) {
        if (student.teacher_verified) {
            return "⏳ Pending on Admin";
        } else {
            return "❌ Rejected by Teacher";
        }
    }
    
    // If teacher hasn't taken action yet
    if (!student.teacher_action) {
        return "⏳ Pending on Teacher";
    }
    
    // If admin has taken action
    if (student.admin_action) {
        if (student.admin_verified) {
            return "✓ Verified";
        } else {
            return "❌ Rejected by Admin";
        }
    }
    
    // Default fallback
    return "⏳ Pending Verification";
}

async function handleResourceRequest(event) {
    event.preventDefault();
    
    try {
        // Get form data according to ResourceRequestModel schema
        const formData = {
            username: document.getElementById('username').value.trim(),
            title: document.getElementById('title').value.trim(),
            purpose: document.getElementById('purpose').value.trim(),
            expiryDate: document.getElementById('expiry-date').value,
            // cpuCores: parseInt(document.getElementById('cpu-cores').value),
            // cpuRam: parseInt(document.getElementById('cpu-ram').value),
            // gpuCount: parseInt(document.getElementById('gpu-count').value),
            gpuRam: parseInt(document.getElementById('gpu-ram').value)
        };
        
        // Validate required fields (include gpuRam)
        if (!formData.username || !formData.title || !formData.purpose || !formData.expiryDate || formData.gpuRam === undefined || formData.gpuRam === null) {
            throw new Error('Please fill in all required fields');
        }

        if (!isValidUsername(formData.username)) {
            throw new Error('Username can only contain letters, numbers, hyphens (-), and underscores (_), with no spaces or special characters');
        }
        // Title max length check
        if (formData.title.length > 50) {
            throw new Error('Title must not exceed 50 characters');
        }

        // Validate gpuRam is non-negative number
        if (!Number.isFinite(formData.gpuRam) || formData.gpuRam < 0) {
            throw new Error('GPU RAM must be a non-negative number');
        }

        if (formData.purpose.length < 100) {
            throw new Error('Purpose must be at least 100 characters long');
        }
                
        // if (formData.cpuCores < 1 || formData.cpuRam < 1) {
        //     throw new Error('CPU cores and RAM must be at least 1');
        // }
        
        // if (formData.gpuCount < 0 || formData.gpuRam < 0) {
        //     throw new Error('GPU values cannot be negative');
        // }
        
        // Handle expiry date defaults, limits, and validation
        const expiryDateInput = document.getElementById('expiry-date');
        if (expiryDateInput) {
            const today = new Date();
            const formatDate = (d) => d.toISOString().split('T')[0];

            // Default → 7 days ahead
            if (!expiryDateInput.value) {
                const defaultDate = new Date();
                defaultDate.setDate(today.getDate() + 7);
                expiryDateInput.value = formatDate(defaultDate);
                formData.expiryDate = expiryDateInput.value;
            }

            // Set min/max limits
            const minDate = new Date();
            minDate.setDate(today.getDate() + 1);
            expiryDateInput.min = formatDate(minDate);

            const maxDate = new Date();
            maxDate.setDate(today.getDate() + 30);
            expiryDateInput.max = formatDate(maxDate);

            // Validate expiry date
            const expiryDate = new Date(formData.expiryDate);
            today.setHours(0, 0, 0, 0); // compare date only

            if (expiryDate <= today) {
                throw new Error('Expiry date must be in the future');
            }
            if (expiryDate < minDate) {
                throw new Error('Expiry date must be at least one day ahead');
            }
            if (expiryDate > maxDate) {
                throw new Error('Expiry date cannot be more than 30 days ahead');
            }
        }
        
        // Get student ID
        const studentId = await getLoggedInStudentId();
        if (!studentId) {
            throw new Error('Student ID not found. Please login again.');
        }
        
        // Disable submit button to prevent double submission
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        // Send request to backend
        const response = await fetch('/dashboard/student/submit-resource-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...formData,
                studentId: studentId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            // Show a specific notification if the error is about pending request
            if (errorData.error && errorData.error.includes('Only one pending request is allowed')) {
                showErrorMessage('You already have a pending request. Please wait for it to be processed or delete it if no action has been taken by teacher/admin.', 'request-content');
                return;
            }
            // If backend returned a simple 'Username already exists' message, show inline under username like other field errors
            if (errorData.error && /username already exists/i.test(errorData.error)) {
                showErrorNotification('Username already taken. Please choose a different username.');
                return;
            }

            throw new Error(errorData.message || (errorData.error || 'Failed to submit request'));
        }
        
        const result = await response.json();
        
        // Show success message
        showSuccessMessage('Resource request submitted successfully! You will be notified once it is processed.');
        
        // Reset form
        document.getElementById('resource-request-form').reset();
        
    } catch (error) {
        console.error('Error submitting resource request:', error);
        showErrorNotification('Failed to submit request: ' + error.message);
    } finally {
        // Re-enable submit button
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Resource Request';
        }
    }
}

// Show error notification popup (non-blocking)
function showErrorNotification(message) {
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

function showSuccessMessage(message) {
    // Create and show success notification
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
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}