import Swal from 'sweetalert2';
import {
  getLoggedInStudentId,
  showErrorMessage,
  getStudentVerificationStatus,
  isValidDuration,
  AllotmentsUtils,
} from '../student.util.js';
import { renderResourcesPage, renderMachineCards } from './raise-request.ui.js';
import { setActiveSidebar } from '../../../common/aside/aside.js';
import { handleLoadViewRequests } from '../view-request/view-request.init.js';
//import { logoutDirectly } from '../../../common/js/commons.js';
//import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';

// API CALLS
export async function fetchStudentData(studentId) {
  const response = await fetch(`/dashboard/student/student_data/${studentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

export async function submitResourceRequest(data) {
  const response = await fetch('/dashboard/student/submit-resource-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
}

//HANDLER
export async function handleLoadRequestResources() {
  try {
    const studentId = await getLoggedInStudentId();

    if (!studentId) {
      throw new Error('Student ID not found. Please login again.');
    }

    const response = await fetchStudentData(studentId);

    if (!response.ok) {
      if (response.status === 404) {
        // logoutDirectly();
        return;
      }
      throw new Error('Failed to fetch student details');
    }

    const studentData = await response.json();

    const verificationStatus = getStudentVerificationStatus(studentData);

    renderResourcesPage(studentData, verificationStatus, handleResourceRequest);

    await loadAvailableMachines();
  } catch (error) {
    console.error('Error loading student details for resources:', error);
    // logoutDirectly();
  }
}

export async function handleResourceRequest(event) {
  event.preventDefault();

  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn.disabled) return;

  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

  try {
    const formData = {
      title: document.getElementById('title').value.trim(),
      purpose: document.getElementById('purpose').value.trim(),
      duration: Number(document.getElementById('duration').value),
      machineId: document.getElementById('raise-selected-machine-id')?.value,
    };

    if (!formData.title || !formData.purpose || !formData.duration) {
      throw new Error('Please fill in all required fields');
    }

    if (formData.title.length > 50) {
      throw new Error('Title must not exceed 50 characters');
    }

    if (formData.purpose.length < 100) {
      throw new Error('Purpose must be at least 100 characters long');
    }

    if (formData.purpose.length > 2000) {
      throw new Error('Purpose must not exceed 2000 characters');
    }

    if (!isValidDuration(formData.duration)) {
      throw new Error('Duration must be a whole number between 1 and 15 days');
    }

    if (!formData.machineId) {
      throw new Error('Please select one available machine before submitting');
    }

    const studentId = await getLoggedInStudentId();
    if (!studentId) {
      throw new Error('Student ID not found. Please login again.');
    }

    const response = await submitResourceRequest({
      ...formData,
      studentId,
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (errorData.error && errorData.error.includes('Only one pending request is allowed')) {
        showErrorMessage(
          'You already have a pending request. Please wait for it to be processed or delete it if no action has been taken by teacher/admin.',
          'request-content',
        );
        return;
      }

      throw new Error(errorData.message || errorData.error || 'Failed to submit request');
    }

    await Swal.fire({
      title: 'Success!',
      text: 'Resource request submitted successfully! You will be notified once it is processed.',
      icon: 'success',
      draggable: true,
      scrollbarPadding: false,
      heightAuto: false,
    });
    document.querySelector('.raise-request')?.classList.add('hide-default');
    document.querySelector('.view-request')?.classList.remove('hide-default');
    setActiveSidebar('view-request');
    await handleLoadViewRequests();
  } catch (error) {
    console.error('Error submitting resource request:', error);
    Swal.fire({
      title: 'Error!',
      text: 'Failed to submit request: ' + error.message,
      icon: 'error',
      draggable: true,
    });
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }
}

export async function loadAvailableMachines() {
  const container = document.getElementById('raise-machines-flexbar');
  if (!container) return;
  try {
    const res = await fetch('/dashboard/get_machines');
    if (!res.ok) throw new Error('Failed to fetch machines');
    const machines = await res.json();
    if (!machines.length) {
      container.innerHTML =
        '<span class="machine-bar-empty">No machines currently available.</span>';
      return;
    }
    for (const machine of machines) {
      try {
        const res = await fetch(`/dashboard/allotments/${machine._id}`);

        const data = await res.json();

        const formatted = AllotmentsUtils.formatAllotments(data.allotments);

        machine.availableFrom = AllotmentsUtils.getAvailableFrom(formatted);
      } catch {
        machine.availableFrom = 'Today';
      }
    }

    renderMachineCards(machines);

    container.addEventListener('click', (e) => {
      const item = e.target.closest('.machine-bar-item');
      if (!item) return;
      const isAlreadySelected = item.classList.contains('selected');
      container
        .querySelectorAll('.machine-bar-item')
        .forEach((el) => el.classList.remove('selected'));
      const hiddenInput = document.getElementById('raise-selected-machine-id');
      if (isAlreadySelected) {
        if (hiddenInput) hiddenInput.value = '';
      } else {
        item.classList.add('selected');
        if (hiddenInput) hiddenInput.value = item.dataset.machineId;
      }
    });
  } catch (err) {
    console.error('Error loading available machines:', err);
    container.innerHTML = '<span class="machine-bar-empty">Could not load machines.</span>';
  }
}

//INIT
// main.js

// App initialization
document.addEventListener('DOMContentLoaded', () => {
  //setupDarkMode();
  handleLoadRequestResources();
});
