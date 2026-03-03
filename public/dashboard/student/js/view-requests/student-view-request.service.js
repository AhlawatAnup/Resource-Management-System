// service.js

export async function fetchStudentRequests(studentId) {
    const response = await fetch(`/dashboard/student/resource-requests/${studentId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response;
}

export async function deleteStudentRequest(requestId) {
    const response = await fetch(`/dashboard/student/del_requests/${requestId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response;
}