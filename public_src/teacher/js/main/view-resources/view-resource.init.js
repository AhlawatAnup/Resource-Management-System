import {
  initializePurposePanel,
  isValidUsername,
  logoutDirectly,
} from '../../../../common/utils/commons.utils.js';

import {
  renderResourceRequests,
  showNotVerifiedMessage,
  showEmptyState,
  showNotification,
  setSubmitButtonState,
  setFieldError,
} from './view-resource.ui.js';
import { filterRequestsList } from '../teacher.utils.js';
import Swal from 'sweetalert2';
//import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';

//API CALLS

// Fetch resource requests from teacher dashboard
export async function fetchResourceRequests() {
  const response = await fetch('/dashboard/teacher/data', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { error: true, status: response.status };
  }

  const data = await response.json();

  return {
    error: false,
    data,
  };
}

// Update request verification (approve/decline)
export async function verifyRequest(requestId, isVerified) {
  const response = await fetch(`/dashboard/teacher/verify_request/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_verified: isVerified }),
  });

  let result = null;

  try {
    result = await response.json();
  } catch (e) {
    // keep behavior same (handled in caller)
  }

  return {
    ok: response.ok,
    data: result,
  };
}

//HANDLERS

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

// INIT ------------------------>


document.addEventListener('DOMContentLoaded', () => {
  //setupDarkMode();
  // Initialize purpose panel & date pickers
  initUIComponentsHandler();

  // Load resource requests
  loadResourceRequestsHandler();

  // Search input
  const searchInput = document.getElementById('searchInputResources');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterRequestsHandler(e.target.value);
    });
     // AUTO FOCUS SEARCH ON TYPING
  document.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('searchInputResources');

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA'
    ) {
      return;
    }

    if (e.key.length === 1) {
      searchInput.focus();
    }
  });
  }

  // Delegate approve/decline buttons
  document.getElementById('requestsTableBody').addEventListener('click', (e) => {
    const button = e.target.closest('.approve-btn, .decline-btn');
    if (!button) return;

    const requestId = button.getAttribute('data-request-id');
    const action = button.getAttribute('data-action');

    const isVerified = action === 'approve';
    updateRequestVerificationHandler(requestId, isVerified);
  });
});


