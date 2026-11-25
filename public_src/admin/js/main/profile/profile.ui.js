// import { handleLogout } from '../../../../common/utils/commons.utils';

// ui/profileUI.js
function $(id) {
  return document.getElementById(id);
}

export function initProfileUI() {
  const emailDisplay = $('admin-email');
  const usernameDisplay = $('admin-username');

  return {
    emailDisplay,
    usernameDisplay,
  };
}

// ------------------ HELPERS ------------------
// function resetButton(btn) {
//   btn.disabled = false;
//   btn.style.opacity = '1';
// }

// export function showError(el, msg) {
//   el.style.color = 'red';
//   el.textContent = msg;
// }

// export function showSuccess(el, msg) {
//   el.style.color = 'green';
//   el.textContent = msg;
// }

// export function toggleLoading(btn, state) {
//   btn.disabled = state;
//   btn.style.opacity = state ? '0.6' : '1';
// }
