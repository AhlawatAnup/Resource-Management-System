// Import common functions
import { formatDate } from '/dashboard/common/js/commons.js';
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
    console.log('Displaying resources page for student:', student);
    
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
                                <strong>Note:</strong> Request the minimum resources you need for your project. You can always submit additional requests if your requirements change.
                            </p>
                        </div>
                        
                        <form id="resource-request-form">
                            <div class="form-group">
                                <label for="title">Request Title:</label>
                                <input type="text" id="title" class="form-control" placeholder="e.g., Machine Learning Training Project" required>
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
                            
                            <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="margin: 0 0 15px 0; color: #333; font-size: 1.1em;">
                                    <i class="fas fa-cube"></i> GPU Requirements (Optional for non-ML tasks)
                                </h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                    <div class="form-group">
                                        <label for="gpu-count">GPU Count Required:</label>
                                        <input type="number" id="gpu-count" class="form-control" min="0" max="8" placeholder="e.g., 2" required>
                                        <small style="color: #666; font-size: 0.85em;">Use 0 if no GPU needed</small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="gpu-ram">GPU RAM per GPU (GB):</label>
                                        <input type="number" id="gpu-ram" class="form-control" min="0" max="80" placeholder="e.g., 12" required>
                                        <small style="color: #666; font-size: 0.85em;">Common: 8-24 GB for deep learning</small>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-paper-plane"></i>
                                Submit Resource Request
                            </button>
                        </form>
                    </div>
                    
                    <!-- Recent Requests Section -->
                    <div id="recent-requests" class="resource-request-section" style="margin-top: 30px;">
                        <h2>
                            <i class="fas fa-history"></i>
                            Your Recent Requests
                        </h2>
                        <div id="requests-list">
                            <!-- Recent requests will be loaded here -->
                        </div>
                    </div>
                </div>
            `;
            
            // Add form submission handler
            const form = document.getElementById('resource-request-form');
            if (form) {
                form.addEventListener('submit', handleResourceRequest);
                
                // Set default expiry date to 30 days from today
                const expiryDateInput = document.getElementById('expiry-date');
                if (expiryDateInput) {
                    const defaultDate = new Date();
                    defaultDate.setDate(defaultDate.getDate() + 30); // 30 days from today
                    expiryDateInput.valueAsDate = defaultDate;
                    
                    // Set minimum date to tomorrow
                    const minDate = new Date();
                    minDate.setDate(minDate.getDate() + 1);
                    expiryDateInput.min = minDate.toISOString().split('T')[0];
                }
            }
            
            // Load recent requests
            loadRecentRequests(student._id);
            
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
    console.log('Student verification fields:', {
        teacher_verified: student.teacher_verified,
        admin_verified: student.admin_verified,
        teacher_action: student.teacher_action,
        admin_action: student.admin_action,
        is_verified: student.is_verified
    });

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
            title: document.getElementById('title').value.trim(),
            purpose: document.getElementById('purpose').value.trim(),
            expiryDate: document.getElementById('expiry-date').value,
            cpuCores: parseInt(document.getElementById('cpu-cores').value),
            cpuRam: parseInt(document.getElementById('cpu-ram').value),
            gpuCount: parseInt(document.getElementById('gpu-count').value),
            gpuRam: parseInt(document.getElementById('gpu-ram').value)
        };
        
        // Validate required fields
        if (!formData.title || !formData.purpose || !formData.expiryDate) {
            throw new Error('Please fill in all required fields');
        }
        
        if (formData.cpuCores < 1 || formData.cpuRam < 1) {
            throw new Error('CPU cores and RAM must be at least 1');
        }
        
        if (formData.gpuCount < 0 || formData.gpuRam < 0) {
            throw new Error('GPU values cannot be negative');
        }
        
        // Validate expiry date is in the future
        const expiryDate = new Date(formData.expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare dates only
        
        if (expiryDate <= today) {
            throw new Error('Expiry date must be in the future');
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
            throw new Error(errorData.message || 'Failed to submit request');
        }
        
        const result = await response.json();
        
        // Show success message
        showSuccessMessage('Resource request submitted successfully! You will be notified once it is processed.');
        
        // Reset form
        document.getElementById('resource-request-form').reset();
        
        // Reload recent requests
        loadRecentRequests(studentId);
        
    } catch (error) {
        console.error('Error submitting resource request:', error);
        showErrorMessage('Failed to submit request: ' + error.message);
    } finally {
        // Re-enable submit button
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Resource Request';
        }
    }
}

async function loadRecentRequests(studentId) {
    try {
        const response = await fetch(`/dashboard/student/resource-requests/${studentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const requests = await response.json();
            displayRecentRequests(requests);
        } else {
            console.warn('Failed to load recent requests');
            document.getElementById('requests-list').innerHTML = '<p>No recent requests found.</p>';
        }
    } catch (error) {
        console.error('Error loading recent requests:', error);
        document.getElementById('requests-list').innerHTML = '<p>Error loading recent requests.</p>';
    }
}

function displayRecentRequests(requests) {
    const requestsList = document.getElementById('requests-list');
    
    if (!requests || requests.length === 0) {
        requestsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No requests submitted yet.</p>';
        return;
    }
    
    const requestsHTML = requests.map(request => {
        const statusClass = getRequestStatusClass(request);
        const statusIcon = getRequestStatusIcon(request);
        const statusText = getRequestStatusText(request);
        
        return `
            <div class="request-item">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: #333;">${request.title}</h4>
                    <span class="status-badge ${statusClass}">
                        ${statusIcon} ${statusText}
                    </span>
                </div>
                <p style="color: #666; margin: 10px 0;">${request.purpose}</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; font-size: 0.9em;">
                    <div><strong>CPU:</strong> ${request.cpuCores} cores, ${request.cpuRam} GB RAM</div>
                    <div><strong>GPU:</strong> ${request.gpuCount} × ${request.gpuRam} GB</div>
                    <div><strong>Expires:</strong> ${formatDate(request.expiryDate)}</div>
                    <div><strong>Submitted:</strong> ${formatDate(request.createdAt)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    requestsList.innerHTML = requestsHTML;
}

function getRequestStatusClass(request) {
    // Check verification status based on database model fields
    if (request.teacher_verified && request.admin_verified && request.is_verified) {
        return 'status-approved';
    }
    
    if (request.teacher_action && !request.teacher_verified) {
        return 'status-rejected';
    }
    
    if (request.admin_action && !request.admin_verified) {
        return 'status-rejected';
    }
    
    if (request.teacher_action && request.teacher_verified && !request.admin_action) {
        return 'status-in-progress';
    }
    
    return 'status-pending';
}

function getRequestStatusIcon(request) {
    // Check verification status based on database model fields
    if (request.teacher_verified && request.admin_verified && request.is_verified) {
        return '✓';
    }
    
    if ((request.teacher_action && !request.teacher_verified) || 
        (request.admin_action && !request.admin_verified)) {
        return '✗';
    }
    
    if (request.teacher_action && request.teacher_verified && !request.admin_action) {
        return '⏳';
    }
    
    return '⏳';
}

function getRequestStatusText(request) {
    // Check verification status based on database model fields
    if (request.teacher_verified && request.admin_verified && request.is_verified) {
        return 'Approved';
    }
    
    if (request.teacher_action && !request.teacher_verified) {
        return 'Rejected by Teacher';
    }
    
    if (request.admin_action && !request.admin_verified) {
        return 'Rejected by Admin';
    }
    
    if (request.teacher_action && request.teacher_verified && !request.admin_action) {
        return 'Pending Admin Approval';
    }
    
    if (!request.teacher_action) {
        return 'Pending Teacher Review';
    }
    
    return 'Pending Review';
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