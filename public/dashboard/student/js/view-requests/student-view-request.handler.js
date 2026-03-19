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

        attachAccessMachineHandlers();

        // updateAccessMachineButtons(allRequests);

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

// async function updateAccessMachineButtons(requests) {
//     for (const request of requests) {
//         if (!request.is_verified) continue;

//         const btn = document.querySelector(
//             `.access-machine-btn[data-request-id="${request._id}"]`
//         );

//         if (!btn) continue;

//         btn.disabled = true;
//         btn.textContent = 'Checking...';

//         try {
//             const data = await fetchRequestAllotmentTime(request._id);

//             if (data && data.startTime && data.endTime) {
//                 const now = Date.now();
//                 const start = new Date(data.startTime).getTime();
//                 const end = new Date(data.endTime).getTime();

//                 if (now >= start && now <= end) {
//                     btn.disabled = false;
//                     btn.textContent = 'Access Machine';
//                 } else {
//                     btn.disabled = true;
//                     btn.textContent = 'Access Machine (Unavailable)';
//                 }
//             } else {
//                 btn.disabled = true;
//                 btn.textContent = 'Access Machine (No Allotment)';
//             }
//         } catch (err) {
//             btn.disabled = true;
//             btn.textContent = 'Access Machine (Error)';
//         }
//     }
// }

function attachAccessMachineHandlers() {
    document.querySelectorAll('.access-machine-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const migid = this.dataset.migid;
            if (migid) {
                // This initial hit sets the session variable on the server
                window.open(`/notebook?migid=${migid}`, '_blank');
            }
        });
    });
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