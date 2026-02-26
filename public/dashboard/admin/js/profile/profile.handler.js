// profile.handler.js
import { showError, showSuccess, toggleLoading } from './profile.ui.js';
import {
  updateEmail,
  updateUsername,
  changePassword
} from './profile.service.js';
import {
  validateEmail,
  validateUsername,
  validatePassword
} from '../shared/admin.util.js';

export async function onEmailSubmit(newEmail, { displayEl, errorEl, modalEl, submitBtn }) {
  const error = validateEmail(newEmail);
  if (error) return showError(errorEl, error);

  toggleLoading(submitBtn, true);

  try {
    const res = await updateEmail(newEmail);
    if (res.success) {
      displayEl.textContent = res.changes?.email || newEmail;
      showSuccess(errorEl, res.message || 'Email updated successfully');
      setTimeout(() => (modalEl.style.display = 'none'), 1200);
    } else {
      showError(errorEl, res.error || 'Failed to update email');
    }
  } catch {
    showError(errorEl, 'Failed to update email');
  }
}

export async function onUsernameSubmit(newUsername, { displayEl, errorEl, modalEl, submitBtn }) {
  const error = validateUsername(newUsername);
  if (error) return showError(errorEl, error);

  toggleLoading(submitBtn, true);

  try {
    const res = await updateUsername(newUsername);
    if (res.success) {
      displayEl.textContent = newUsername;
      showSuccess(errorEl, res.message || 'Username updated successfully');
      setTimeout(() => (modalEl.style.display = 'none'), 1200);
    } else {
      showError(errorEl, res.error || 'Failed to update username');
    }
  } catch {
    showError(errorEl, 'Failed to update username');
  }
}

export async function onPasswordSubmit(newPassword, confirmPassword, { errorEl, modalEl, submitBtn }) {
  const error = validatePassword(newPassword, confirmPassword);
  if (error) return showError(errorEl, error);

  toggleLoading(submitBtn, true);

  try {
    const res = await changePassword(newPassword);
    if (res.success) {
      showSuccess(errorEl, res.message || 'Password changed successfully');
      setTimeout(() => (modalEl.style.display = 'none'), 1200);
    } else {
      showError(errorEl, res.error || 'Failed to change password');
    }
  } catch {
    showError(errorEl, 'Failed to change password');
  }
}
