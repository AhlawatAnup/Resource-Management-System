// ui/profileUI.js

import {
  fetchAdminProfile,
  updateEmail,
  updateUsername,
  changePassword
} from './profile.service.js';

import {
  validateEmail,
  validateUsername,
  validatePassword
} from '../shared/admin.util.js';

function $(id) {
  return document.getElementById(id);
}

export function initProfileUI() {
  loadProfile();
  setupEmail();
  setupUsername();
  setupPassword();
}

// ------------------ PROFILE ------------------

async function loadProfile() {
  try {
    const data = await fetchAdminProfile();

    if (data.username) {
      $('admin-username').textContent = data.username;
      $('admin-email').textContent = data.email;
    } else {
      $('profile-error').textContent =
        data.error || 'Unable to fetch admin details.';
    }
  } catch {
    $('profile-error').textContent = 'Unable to fetch admin details.';
  }
}

// ------------------ EMAIL ------------------

function setupEmail() {
  const modal = $('edit-email-modal');
  const openBtn = $('edit-email-btn');
  const closeBtn = $('close-email-modal');
  const cancelBtn = $('cancel-email-btn');
  const submitBtn = $('submit-email-btn');
  const input = $('new-email-input');
  const errorDiv = $('email-error');
  const display = $('admin-email');

  openBtn.onclick = () => {
    modal.style.display = 'flex';
    input.value = display.textContent;
    errorDiv.textContent = '';
    resetButton(submitBtn);
  };

  closeBtn.onclick = cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };

  submitBtn.onclick = async (e) => {
    e.preventDefault();
    toggleLoading(submitBtn, true);

    const email = input.value.trim();
    const error = validateEmail(email);

    if (error) {
      showError(errorDiv, error);
      toggleLoading(submitBtn, false);
      return;
    }

    try {
      const data = await updateEmail(email);

      if (data.success) {
        showSuccess(errorDiv, data.message);
        display.textContent = data?.changes?.email || email;
        setTimeout(() => (modal.style.display = 'none'), 1200);
      } else {
        showError(errorDiv, data.error || 'Failed');
        toggleLoading(submitBtn, false);
      }
    } catch {
      showError(errorDiv, 'Failed to update email.');
      toggleLoading(submitBtn, false);
    }
  };
}

// ------------------ USERNAME ------------------

function setupUsername() {
  const modal = $('edit-username-modal');
  const openBtn = $('edit-username-btn');
  const closeBtn = $('close-username-modal');
  const cancelBtn = $('cancel-username-btn');
  const submitBtn = $('submit-username-btn');
  const input = $('new-username-input');
  const errorDiv = $('username-error');
  const display = $('admin-username');

  openBtn.onclick = () => {
    modal.style.display = 'flex';
    input.value = display.textContent;
    errorDiv.textContent = '';
    resetButton(submitBtn);
  };

  closeBtn.onclick = cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };

  submitBtn.onclick = async (e) => {
    e.preventDefault();
    toggleLoading(submitBtn, true);

    const username = input.value.trim();
    const error = validateUsername(username);

    if (error) {
      showError(errorDiv, error);
      toggleLoading(submitBtn, false);
      return;
    }

    try {
      const data = await updateUsername(username);

      if (data.success) {
        showSuccess(errorDiv, data.message);
        display.textContent = username;
        setTimeout(() => (modal.style.display = 'none'), 1200);
      } else {
        showError(errorDiv, data.error || 'Failed');
        toggleLoading(submitBtn, false);
      }
    } catch {
      showError(errorDiv, 'Failed to update username.');
      toggleLoading(submitBtn, false);
    }
  };
}

// ------------------ PASSWORD ------------------

function setupPassword() {
  const modal = $('change-password-modal');
  const openBtn = $('change-password-btn');
  const closeBtn = $('close-password-modal');
  const cancelBtn = $('cancel-password-btn');
  const submitBtn = $('submit-password-btn');
  const newInput = $('new-password');
  const confirmInput = $('confirm-password');
  const errorDiv = $('password-error');

  openBtn.onclick = () => {
    modal.style.display = 'flex';
    newInput.value = '';
    confirmInput.value = '';
    errorDiv.textContent = '';
    resetButton(submitBtn);
  };

  closeBtn.onclick = cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };

  submitBtn.onclick = async (e) => {
    e.preventDefault();
    toggleLoading(submitBtn, true);

    const error = validatePassword(
      newInput.value.trim(),
      confirmInput.value.trim()
    );

    if (error) {
      showError(errorDiv, error);
      toggleLoading(submitBtn, false);
      return;
    }

    try {
      const data = await changePassword(newInput.value.trim());

      if (data.success) {
        showSuccess(errorDiv, data.message);
        setTimeout(() => (modal.style.display = 'none'), 1200);
      } else {
        showError(errorDiv, data.error || 'Failed');
        toggleLoading(submitBtn, false);
      }
    } catch {
      showError(errorDiv, 'Failed to change password.');
      toggleLoading(submitBtn, false);
    }
  };
}

// ------------------ HELPERS ------------------

function toggleLoading(btn, state) {
  btn.disabled = state;
  btn.style.opacity = state ? '0.6' : '1';
}

function showError(el, msg) {
  el.style.color = 'red';
  el.textContent = msg;
}

function showSuccess(el, msg) {
  el.style.color = 'green';
  el.textContent = msg;
}

function resetButton(btn) {
  btn.disabled = false;
  btn.style.opacity = '1';
}