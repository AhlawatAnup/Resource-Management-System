// handlers.js

// Utils
import {
    getLoggedInStudentId,
    showLoadingState
} from '../student.utils.js';

// Services
import {
    fetchStudentRequests,
    deleteStudentRequest,
    fetchRequestAllotmentTime
} from './student-view-request.service.js';

// UI
import {
    renderRequestsPageStructure,
    renderAllRequests,
    filterRequests
} from './student-view-request.ui.js';

// External
import { logoutDirectly } from '../../../common/js/commons.js';

import { fetchTokenForMigid } from './student-view-request.service.js';

let allRequests = [];


// ==============================
// Page Load
// ==============================

export async function handleLoadViewRequests() {
    try {
        showLoadingState('requests-content');

        const studentId = await getLoggedInStudentId();

        if (!studentId) {
            console.error('Student ID not found');
            logoutDirectly();
            return;
        }

        renderRequestsPageStructure(handleFilterChange);

        await loadRequests(studentId);

    } catch (error) {
        console.error('Error loading view requests page:', error);
        document.getElementById('requests-content').innerHTML = `
            <div class="error-message">
                <p>Failed to load requests. Please try again.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// ==============================
// Load Requests
// ==============================

async function loadRequests(studentId) {
    try {
        const response = await fetchStudentRequests(studentId);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403 || response.status === 404) {
                logoutDirectly();
                return;
            }

            document.getElementById('all-requests-list').innerHTML =
                '<div class="no-requests"><p>No requests found.</p></div>';
            return;
        }

        const data = await response.json();
        allRequests = data;

        renderAllRequests(allRequests, handleDeleteRequest, reloadPage);
        await processVerifiedRequests();

    } catch (error) {
        console.error('Error loading requests:', error);
        document.getElementById('all-requests-list').innerHTML =
            '<div class="error-message"><p>Error loading requests.</p></div>';
    }
}

// ==============================
// Delete
// ==============================

async function handleDeleteRequest(requestId) {
    try {
        const response = await deleteStudentRequest(requestId);

        if (!response.ok) {
            throw new Error('Delete failed');
        }

        await Swal.fire({
            title: 'Deleted!',
            text: 'Your request has been deleted.',
            icon: 'success',
            draggable: true
        });

    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: 'Failed to delete request.',
            icon: 'error',
            draggable: true
        });
    }
}



function attachAccessMachineHandlers() {
    document.querySelectorAll('.access-machine-btn').forEach(btn => {
    btn.addEventListener('click', async function () {
        const migid = this.dataset.migid;
        if (!migid) return;

        try {
            const res = await fetch('/proxy/set-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // important for session
                body: JSON.stringify({ migid })
            });
            const data = await res.json();

            if (res.ok) {
                window.open('/', '_blank'); // open proxy only if session is set
            } else {
                alert(data.message || 'Failed to initialize session');
            }
        } catch (err) {
            console.error(err);
            alert('Error setting session');
        }
    });
});
}

export async function processVerifiedRequests() {
    await Promise.all(
        allRequests.map(async (request) => {
            if (request.is_verified && request.machineId?.MIGID) {
                try {
                    const allotment = await fetchRequestAllotmentTime(request._id);
                    if (allotment && allotment.startTime && allotment.endTime) {
                        // Store allotment times on the request object
                        request.allotmentStartTime = allotment.startTime;
                        request.allotmentEndTime = allotment.endTime;
                        const now = Date.now();
                        const start = new Date(allotment.startTime).getTime();
                        const end = new Date(allotment.endTime).getTime();
                        if (now >= start && now <= end) {
                            request.isAllotmentActive = true;
                            const token = await handleLoadToken(request.machineId.MIGID, request._id);
                            request.token = token || null;
                        } else {
                            request.isAllotmentActive = false;
                            request.token = null;
                        }
                    } else {
                        request.isAllotmentActive = false;
                        request.token = null;
                        request.allotmentStartTime = null;
                        request.allotmentEndTime = null;
                    }
                } catch (err) {
                    request.isAllotmentActive = false;
                    request.token = null;
                    request.allotmentStartTime = null;
                    request.allotmentEndTime = null;
                }
            } else {
                request.isAllotmentActive = false;
                request.token = null;
                request.allotmentStartTime = null;
                request.allotmentEndTime = null;
            }
        })
    );

    renderAllRequests(allRequests, handleDeleteRequest, reloadPage);
    attachAccessMachineHandlers();
}

async function handleLoadToken(migid, requestId) {
    try {
        const response = await fetchTokenForMigid(migid, requestId);
        if (!response.ok) return null;

        const data = await response.json();
        return data?.token ?? null;

    } catch {
        return null;
    }
}


// ==============================
// Filter
// ==============================

function handleFilterChange(status) {
    filterRequests(status);
}

// ==============================
// Reload
// ==============================

function reloadPage() {
    handleLoadViewRequests();
}