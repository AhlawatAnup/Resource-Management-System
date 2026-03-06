// Import utility functions
import { formatDate, logoutDirectly } from '/dashboard/common/js/commons.js';
import { getLoggedInStudentId, showLoadingState, showErrorMessage } from './student.utils.js';
import { registerServiceWorkerAndSubscribe } from '../../common/js/notification.js';

document.addEventListener('DOMContentLoaded', function() {
    // Get student details when page loads
    loadStudentDetails();
    registerServiceWorkerAndSubscribe();
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
        const response = await fetch(`/dashboard/student/student_data/${studentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // If student account not found (404), logout user
            if (response.status === 404) {
                logoutDirectly();
                return;
            }
            throw new Error('Failed to fetch student details');
        }

        const studentData = await response.json();
        displayStudentDetails(studentData);
        
    } catch (error) {
        console.error('Error loading student details:', error);
        logoutDirectly();
    }
}

function displayStudentDetails(student) {
    // console.log('Displaying student details:', student); // Debug log
    
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
                        <p style="margin: 5px 0; color: #666; font-size: 1.1em;">Roll No: ${student.rollNo}</p>
                        <span class="verification-badge ${statusClass}" style="display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 0.9em; font-weight: bold;">${verificationStatus}</span>
                    </div>
                </div>
                <div class="profile-details" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 600px;">
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Email:</span>
                        <span class="value" style="color: #333; font-size: 1em;">${student.email}</span>
                    </div>
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Branch:</span>
                        <span class="value" style="color: #333; font-size: 1em;">${student.branch}</span>
                    </div>
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Institute Name:</span>
                        <span class="value" style="color: #333; font-size: 1em;">${student.instituteName || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Institute Address:</span>
                        <span class="value" style="color: #333; font-size: 1em;">${student.instituteAddress || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Teacher:</span>
                        <span class="value" style="color: #333; font-size: 1em;">${student.teacher?.name || 'Not assigned'}</span>
                    </div>
                    <div class="detail-row" style="margin-bottom: 15px;">
                        <span class="label" style="font-weight: 600; color: #555; display: block;">Created:</span>
                        <span class="value" style="color: #333; font-size: 1em;">${formatDate(student.createdAt)}</span>
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