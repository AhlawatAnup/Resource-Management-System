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

export async function fetchRequestAllotmentTime(requestId) {
    const response = await fetch(`/dashboard/student/allotment-time/${requestId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) return null;
    return response.json();
}

export async function fetchTokenForMigid(migid) {
    if (!migid) throw new Error('MIGID is required');
    const response = await fetch(`/proxy/token/${migid}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });
    return response;
}