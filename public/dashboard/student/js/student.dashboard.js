document.addEventListener('DOMContentLoaded', function() {
    // Get student details when page loads
    loadStudentDetails();
    
    // Add navigation functionality
    setupNavigation();
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        // Skip logout link - let it work normally
        if (item.href && item.href.includes('/logout')) {
            return;
        }
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the text content to determine which page to show
            const pageTitle = this.textContent.trim();
            
            if (pageTitle === 'Home') {
                showHomePage();
            } else if (pageTitle === 'Request Resources') {
                showRequestResourcesPage();
            }
        });
    });
}

function showHomePage() {
    // Reload student details for home page
    loadStudentDetails();
}

function showRequestResourcesPage() {
    // Load student details to check verification status
    loadStudentDetailsForResources();
}

async function loadStudentDetails() {
    try {
        // Show loading state
        showLoadingState();
        
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
        displayStudentDetails(studentData);
        
    } catch (error) {
        console.error('Error loading student details:', error);
        showErrorMessage('Failed to load student details. Please try again.');
    }
}

async function getLoggedInStudentId() {
    try {
        const response = await fetch('/dashboard/current-user-id', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.id) {
                // Store for future use
                localStorage.setItem('studentId', data.id);
                return data.id;
            }
        }
    } catch (error) {
        console.error('Error fetching user ID from session:', error);
    }
    
    return null;
}

function displayStudentDetails(student) {
    console.log('Displaying student details:', student); // Debug log
    
    // Determine verification status based on new schema
    const verificationStatus = getStudentVerificationStatus(student);
    const statusClass = getStudentStatusClass(student);
    
    // Update student name in header/welcome section
    const welcomeElement = document.getElementById('student-welcome');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${student.name}`;
    }

    // Update student profile section
    const profileSection = document.getElementById('student-profile');
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="profile-card" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 30px;">
                <div class="profile-header" style="display: flex; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                    <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5em; font-weight: bold; margin-right: 25px;">
                        ${student.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="profile-info">
                        <h2 style="margin: 0 0 8px 0; color: #333; font-size: 2em;">${student.name}</h2>
                        <p style="margin: 5px 0; color: #666; font-size: 1.1em;">Student ID: ${student._id}</p>
                        <p style="margin: 5px 0; color: #666; font-size: 1.1em;">Roll No: ${student.rollNo}</p>
                        <span class="verification-badge ${statusClass}" style="display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 0.9em; font-weight: bold;">${verificationStatus}</span>
                    </div>
                </div>
                <div class="profile-details" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 600px;">
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Email:</span>
                        <span class="value" style="color: #333; font-size: 1.1em;">${student.email}</span>
                    </div>
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Branch:</span>
                        <span class="value" style="color: #333; font-size: 1.1em;">${student.branch}</span>
                    </div>
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Teacher:</span>
                        <span class="value" style="color: #333; font-size: 1.1em;">${student.teacher?.name || 'Not assigned'}</span>
                    </div>
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Created:</span>
                        <span class="value" style="color: #333; font-size: 1.1em;">${formatDate(student.createdAt)}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

function updateDashboardElements(student) {
    // Update any other elements that should show student info
    const elements = document.querySelectorAll('[data-student-name]');
    elements.forEach(element => {
        element.textContent = student.name;
    });

    const idElements = document.querySelectorAll('[data-student-id]');
    idElements.forEach(element => {
        element.textContent = student.studentId || student._id;
    });
}

function showLoadingState() {
    const profileSection = document.getElementById('student-profile');
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading student details...</p>
            </div>
        `;
    }
}

function showErrorMessage(message) {
    const profileSection = document.getElementById('student-profile');
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="loadStudentDetails()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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

// Function to get CSS class for student verification status
function getStudentStatusClass(student) {
    // If both teacher and admin have verified
    if (student.teacher_verified && student.admin_verified) {
        return "status-verified";
    }
    
    // If teacher has taken action but admin hasn't
    if (student.teacher_action && !student.admin_action) {
        if (student.teacher_verified) {
            return "status-pending-admin";
        } else {
            return "status-rejected";
        }
    }
    
    // If teacher hasn't taken action yet
    if (!student.teacher_action) {
        return "status-pending-teacher";
    }
    
    // If admin has taken action
    if (student.admin_action) {
        if (student.admin_verified) {
            return "status-verified";
        } else {
            return "status-rejected";
        }
    }
    
    // Default fallback
    return "status-pending";
}

async function loadStudentDetailsForResources() {
    try {
        // Show loading state
        showLoadingState();
        
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
        showErrorMessage('Failed to load student details. Please try again.');
    }
}

function displayResourcesPage(student) {
    console.log('Displaying resources page for student:', student);
    
    // Check if student is verified
    const isVerified = student.teacher_verified && student.admin_verified;
    const verificationStatus = getStudentVerificationStatus(student);
    
    // Update the main content area
    const profileSection = document.getElementById('student-profile');
    if (profileSection) {
        if (isVerified) {
            // Show welcome message and resource request interface for verified students
            profileSection.innerHTML = `
                <div class="resources-page">
                    <div class="verification-notice verified" style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 1.3em; font-weight: 600;">
                            <i class="fas fa-check-circle" style="font-size: 1.6em;"></i>
                            <span>Welcome! You are verified and eligible to request resources</span>
                        </div>
                    </div>
                    
                    <div class="resource-request-section" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px; font-size: 1.8em;">
                            <i class="fas fa-plus-circle" style="color: #4CAF50; margin-right: 10px;"></i>
                            Request Resources
                        </h2>
                        
                        <form id="resource-request-form" style="max-width: 600px;">
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Resource Type:</label>
                                <select id="resource-type" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;" required>
                                    <option value="">Select resource type...</option>
                                    <option value="computer">Computer/Laptop</option>
                                    <option value="projector">Projector</option>
                                    <option value="lab-equipment">Lab Equipment</option>
                                    <option value="software">Software License</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Description:</label>
                                <textarea id="resource-description" rows="4" placeholder="Please describe the resource you need and its intended use..." style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; resize: vertical;" required></textarea>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Duration Needed:</label>
                                <input type="text" id="duration" placeholder="e.g., 2 hours, 1 day, 1 week" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;" required>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Priority:</label>
                                <select id="priority" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em;" required>
                                    <option value="">Select priority...</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            
                            <button type="submit" style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 12px 30px; border: none; border-radius: 8px; font-size: 1.1em; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                <i class="fas fa-paper-plane" style="margin-right: 8px;"></i>
                                Submit Request
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
            profileSection.innerHTML = `
                <div class="resources-page">
                    <div class="verification-notice pending" style="background: linear-gradient(135deg, #ff9800, #f57c00); color: white; padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center; box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 1.3em; font-weight: 600; margin-bottom: 15px;">
                            <i class="fas fa-exclamation-circle" style="font-size: 1.6em;"></i>
                            <span>Verification Required</span>
                        </div>
                        <p style="margin: 0; font-size: 1.1em; opacity: 0.95;">Your verification status: ${verificationStatus}</p>
                    </div>
                    
                    <div class="verification-info" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px; font-size: 1.8em;">
                            <i class="fas fa-info-circle" style="color: #ff9800; margin-right: 10px;"></i>
                            Resource Request Information
                        </h2>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
                            <h3 style="margin-top: 0; color: #333;">Verification Process</h3>
                            <p style="margin-bottom: 15px; color: #666;">To request resources, you need to complete the verification process:</p>
                            <ol style="color: #666; line-height: 1.6;">
                                <li>Your teacher needs to review and approve your profile</li>
                                <li>An admin needs to provide final verification</li>
                                <li>Once verified, you can request resources from the system</li>
                            </ol>
                            <p style="margin-bottom: 0; color: #666; font-weight: 600;">Current Status: ${verificationStatus}</p>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                            <p style="margin: 0; color: #1976d2;">
                                <i class="fas fa-lightbulb" style="margin-right: 8px;"></i>
                                <strong>Tip:</strong> Contact your assigned teacher or admin if you have questions about the verification process.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

function handleResourceRequest(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        resourceType: document.getElementById('resource-type').value,
        description: document.getElementById('resource-description').value,
        duration: document.getElementById('duration').value,
        priority: document.getElementById('priority').value
    };
    
    // Here you would typically send the data to your backend
    console.log('Resource request submitted:', formData);
    
    // Show success message
    alert('Resource request submitted successfully! You will be notified once it is processed.');
    
    // Reset form
    document.getElementById('resource-request-form').reset();
}