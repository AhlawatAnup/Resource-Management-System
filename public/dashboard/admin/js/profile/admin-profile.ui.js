// ui/profileUI.js
function $(id) { return document.getElementById(id); }

export function initProfileUI({
  onEmailSubmit,
  onUsernameSubmit,
  onPasswordSubmit
}) {
  // ------------------ EMAIL ------------------
  const emailModal = $('edit-email-modal');
  const emailOpenBtn = $('edit-email-btn');
  const emailCloseBtn = $('close-email-modal');
  const emailCancelBtn = $('cancel-email-btn');
  const emailSubmitBtn = $('submit-email-btn');
  const emailInput = $('new-email-input');
  const emailErrorDiv = $('email-error');
  const emailDisplay = $('admin-email');

  emailOpenBtn.addEventListener('click', () => {
    emailModal.style.display = 'flex';
    emailInput.value = emailDisplay.textContent;
    emailErrorDiv.textContent = '';
    resetButton(emailSubmitBtn);
  });

  emailCloseBtn.addEventListener('click', () => (emailModal.style.display = 'none'));
  emailCancelBtn.addEventListener('click', () => (emailModal.style.display = 'none'));

  emailSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    onEmailSubmit?.(emailInput.value.trim(), {
      displayEl: emailDisplay,
      errorEl: emailErrorDiv,
      modalEl: emailModal,
      submitBtn: emailSubmitBtn
    });
  });

  // ------------------ USERNAME ------------------
  const usernameModal = $('edit-username-modal');
  const usernameOpenBtn = $('edit-username-btn');
  const usernameCloseBtn = $('close-username-modal');
  const usernameCancelBtn = $('cancel-username-btn');
  const usernameSubmitBtn = $('submit-username-btn');
  const usernameInput = $('new-username-input');
  const usernameErrorDiv = $('username-error');
  const usernameDisplay = $('admin-username');

  usernameOpenBtn.addEventListener('click', () => {
    usernameModal.style.display = 'flex';
    usernameInput.value = usernameDisplay.textContent;
    usernameErrorDiv.textContent = '';
    resetButton(usernameSubmitBtn);
  });

  usernameCloseBtn.addEventListener('click', () => (usernameModal.style.display = 'none'));
  usernameCancelBtn.addEventListener('click', () => (usernameModal.style.display = 'none'));

  usernameSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    onUsernameSubmit?.(usernameInput.value.trim(), {
      displayEl: usernameDisplay,
      errorEl: usernameErrorDiv,
      modalEl: usernameModal,
      submitBtn: usernameSubmitBtn
    });
  });

  // ------------------ PASSWORD ------------------
  const passwordModal = $('change-password-modal');
  const passwordOpenBtn = $('change-password-btn');
  const passwordCloseBtn = $('close-password-modal');
  const passwordCancelBtn = $('cancel-password-btn');
  const passwordSubmitBtn = $('submit-password-btn');
  const passwordNewInput = $('new-password');
  const passwordConfirmInput = $('confirm-password');
  const passwordErrorDiv = $('password-error');

  passwordOpenBtn.addEventListener('click', () => {
    passwordModal.style.display = 'flex';
    passwordNewInput.value = '';
    passwordConfirmInput.value = '';
    passwordErrorDiv.textContent = '';
    resetButton(passwordSubmitBtn);
  });

  passwordCloseBtn.addEventListener('click', () => (passwordModal.style.display = 'none'));
  passwordCancelBtn.addEventListener('click', () => (passwordModal.style.display = 'none'));

  passwordSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    onPasswordSubmit?.(
      passwordNewInput.value.trim(),
      passwordConfirmInput.value.trim(),
      {
        errorEl: passwordErrorDiv,
        modalEl: passwordModal,
        submitBtn: passwordSubmitBtn
      }
    );
  });

  // Return helpers if you want
  return {
    emailDisplay,
    usernameDisplay
  };
}

// ------------------ HELPERS ------------------
function resetButton(btn) {
  btn.disabled = false;
  btn.style.opacity = '1';
}

export function showError(el, msg) {
  el.style.color = 'red';
  el.textContent = msg;
}

export function showSuccess(el, msg) {
  el.style.color = 'green';
  el.textContent = msg;
}

export function toggleLoading(btn, state) {
  btn.disabled = state;
  btn.style.opacity = state ? '0.6' : '1';
}