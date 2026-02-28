// ui.js

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

export function displayStudentDetails(student, {
    getStudentVerificationStatus,
    getStudentStatusClass,
    formatDate
}) {
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

export function updateDashboardElements(student) {
    const elements = document.querySelectorAll('[data-student-name]');
    elements.forEach(element => {
        element.textContent = student.name;
    });

    const idElements = document.querySelectorAll('[data-student-id]');
    idElements.forEach(element => {
        element.textContent = student.studentId || student._id;
    });
}