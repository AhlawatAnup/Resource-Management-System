// service.js

export async function fetchStudentDetails(studentId) {
    const response = await fetch(`/dashboard/student/student_data/${studentId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response;
}

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