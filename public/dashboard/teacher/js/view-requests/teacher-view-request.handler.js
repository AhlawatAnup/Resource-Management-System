import { fetchResourceRequests, verifyRequest } from './teacher-view-request.service.js';
import {
  renderResourceRequests,
  showNotVerifiedMessage,
  showEmptyState,
  showNotification,
  setSubmitButtonState,
  setFieldError,
} from './teacher-view-request.ui.js';
import { filterRequestsList } from '../teacher.utils.js';
import {
  initializePurposePanel,
  isValidUsername,
  logoutDirectly,
} from '../../../common/js/commons.js';

// Local state
let resourceRequests = [];
let filteredRequests = [];
let teacherVerificationStatus = { is_verified: false };

// Load and render resource requests
export async function loadResourceRequestsHandler() {
  try {
    const { error, data } = await fetchResourceRequests();
    if (error) {
      //   if (data === 404) logoutDirectly();
      return;
    }

    teacherVerificationStatus = {
      is_verified: data.is_verified,
      verification_completed: data.verification_completed,
    };

    if (!teacherVerificationStatus.is_verified) {
      showNotVerifiedMessage();
      return;
    }

    resourceRequests = data.resourceRequests || [];
    filteredRequests = [...resourceRequests];

    renderResourceRequests(filteredRequests);
  } catch (err) {
    console.error('Error fetching resource requests:', err);
    // logoutDirectly();
  }
}

// Filter requests
export function filterRequestsHandler(searchTerm) {
  if (!resourceRequests.length) {
    showEmptyState();
    return;
  }
  filteredRequests = filterRequestsList(resourceRequests, searchTerm);
  renderResourceRequests(filteredRequests);
}

// Update verification
export async function updateRequestVerificationHandler(requestId, isVerified) {
  if (!teacherVerificationStatus.is_verified) {
    showNotification('You must be verified by admin before approving resource requests', 'error');
    return;
  }

  try {
    const action = isVerified ? 'approve' : 'decline';
    const result_confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${action} this resource request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
      draggable: true,
      scrollbarPadding: false,
      heightAuto: false,
    });

    if (!result_confirmation.isConfirmed) return;

    const { ok } = await verifyRequest(requestId, isVerified);
    if (!ok) throw new Error('Failed to update request verification');

    showNotification(
      `Resource request ${isVerified ? 'approved' : 'declined'} successfully!`,
      'success',
    );
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (err) {
    console.error('Error updating request verification:', err);
    showNotification('Failed to update request verification. Please try again.', 'error');
  }
}

// Initialize other UI components
export function initUIComponentsHandler() {
  initializePurposePanel();
}
