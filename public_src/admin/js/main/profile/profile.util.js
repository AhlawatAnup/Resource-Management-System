// utils/profileUtils.js
import { isValidUsername } from '../../../../common/utils/commons.utils.js';

export function validateEmail(email) {
  if (!email) return 'Please enter a new email.';
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validateUsername(username) {
  if (!username) return 'Please enter a new username.';
  if (!isValidUsername(username)) {
    return 'Username can only contain letters, numbers, hyphens (-), and underscores (_)';
  }
  return null;
}

export function validatePassword(newPassword, confirmPassword) {
  if (!newPassword || !confirmPassword) {
    return 'Please fill both password fields.';
  }
  if (newPassword.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  if (newPassword !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}
