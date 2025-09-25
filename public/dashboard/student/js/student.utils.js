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
                localStorage.setItem('studentId', data.id);
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
                <button onclick="location.reload()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}