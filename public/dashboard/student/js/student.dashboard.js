document.addEventListener('DOMContentLoaded', function() {
    // Get student details when page loads
    loadStudentDetails();
});

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
        const response = await fetch(`/dashboard/teacher/student_data/${studentId}`, {
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
                        <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; ${student.is_verified ? 'background: #d4edda; color: #155724;' : 'background: #fff3cd; color: #856404;'}">${student.is_verified ? '✓ Verified' : '⏳ Pending Verification'}</span>
                    </div>
                </div>
                <div class="profile-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
                    <div class="detail-group">
                        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 1.3em; border-bottom: 2px solid #007bff; padding-bottom: 8px;">Contact Information</h3>
                        <div class="detail-row" style="margin-bottom: 12px;">
                            <span class="label" style="font-weight: 600; color: #555; display: inline-block; width: 100px;">Email:</span>
                            <span class="value" style="color: #333;">${student.email}</span>
                        </div>
                    </div>
                    <div class="detail-group">
                        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 1.3em; border-bottom: 2px solid #28a745; padding-bottom: 8px;">Academic Details</h3>
                        <div class="detail-row" style="margin-bottom: 12px;">
                            <span class="label" style="font-weight: 600; color: #555; display: inline-block; width: 100px;">Branch:</span>
                            <span class="value" style="color: #333;">${student.branch}</span>
                        </div>
                        <div class="detail-row" style="margin-bottom: 12px;">
                            <span class="label" style="font-weight: 600; color: #555; display: inline-block; width: 100px;">Teacher:</span>
                            <span class="value" style="color: #333;">${student.teacher?.name || 'Not assigned'}</span>
                        </div>
                    </div>
                    <div class="detail-group">
                        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 1.3em; border-bottom: 2px solid #ffc107; padding-bottom: 8px;">Account Information</h3>
                        <div class="detail-row" style="margin-bottom: 12px;">
                            <span class="label" style="font-weight: 600; color: #555; display: inline-block; width: 100px;">Created:</span>
                            <span class="value" style="color: #333;">${formatDate(student.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Update quick info sections
    updateQuickInfo(student);
}

function updateQuickInfo(student) {
    // Update verification status
    const verificationStatus = document.getElementById('verification-status');
    if (verificationStatus) {
        verificationStatus.textContent = student.is_verified ? 'Verified ✓' : 'Pending Verification';
        verificationStatus.style.color = student.is_verified ? '#28a745' : '#ffc107';
    }

    // Update academic info
    const academicInfo = document.getElementById('academic-info');
    if (academicInfo) {
        academicInfo.textContent = `${student.branch} - Roll: ${student.rollNo}`;
    }

    // Update teacher info
    const teacherInfo = document.getElementById('teacher-info');
    if (teacherInfo) {
        teacherInfo.textContent = student.teacher.name || 'Not assigned';
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