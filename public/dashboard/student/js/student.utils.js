// Student-specific utility functions

export async function getLoggedInStudentId() {
    try {
        const response = await fetch('/dashboard/current-user-id', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.id) {
                // Store for future use
                // localStorage.setItem('studentId', data.id);
                return data.id;
            }
        }
    } catch (error) {
        console.error('Error fetching user ID from session:', error);
    }
    
    return null;
}

export function showLoadingState(containerId = 'student-profile') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }
}

export function showErrorMessage(message, containerId = 'student-profile') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="retry-btn" onclick="this.disabled=true; location.reload()">Retry</button>
            </div>
        `;
    }
}

// utils.js

// Function to determine student verification status based on schema
export function getStudentVerificationStatus(student) {
    if (student.teacher_verified && student.admin_verified) {
        return "✓ Verified";
    }
    
    if (student.teacher_action && !student.admin_action) {
        if (student.teacher_verified) {
            return "⏳ Pending on Admin";
        } else {
            return "❌ Rejected by Teacher";
        }
    }
    
    if (!student.teacher_action) {
        return "⏳ Pending on Teacher";
    }
    
    if (student.admin_action) {
        if (student.admin_verified) {
            return "✓ Verified";
        } else {
            return "❌ Rejected by Admin";
        }
    }
    
    return "⏳ Pending Verification";
}

// Function to get CSS class for student verification status
export function getStudentStatusClass(student) {
    if (student.teacher_verified && student.admin_verified) {
        return "status-verified";
    }
    
    if (student.teacher_action && !student.admin_action) {
        if (student.teacher_verified) {
            return "status-pending-admin";
        } else {
            return "status-rejected";
        }
    }
    
    if (!student.teacher_action) {
        return "status-pending-teacher";
    }
    
    if (student.admin_action) {
        if (student.admin_verified) {
            return "status-verified";
        } else {
            return "status-rejected";
        }
    }
    
    return "status-pending";
}

// Validate expiry date for resource requests
export function validateExpiryDate(expiryDateValue, minDays = 1, maxDays = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date();
    minDate.setDate(today.getDate() + minDays);
    minDate.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + maxDays);
    maxDate.setHours(0, 0, 0, 0);

    const expiryDate = new Date(expiryDateValue);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate <= today) {
        throw new Error('Expiry date must be in the future');
    }
    if (expiryDate < minDate) {
        throw new Error(`Expiry date must be at least ${minDays} day(s) ahead`);
    }
    if (expiryDate > maxDate) {
        throw new Error(`Expiry date cannot be more than ${maxDays} days ahead`);
    }

    return expiryDate;
}
