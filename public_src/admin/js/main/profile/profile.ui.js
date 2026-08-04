import { handleLogout } from '../../../../common/utils/commons.utils';

// ui/profileUI.js
function $(id) {
  return document.getElementById(id);
}

export function initProfileUI({ handleEmailSubmit, handleUsernameSubmit, handlePasswordSubmit }) {
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
    handleEmailSubmit?.(emailInput.value.trim(), {
      displayEl: emailDisplay,
      errorEl: emailErrorDiv,
      modalEl: emailModal,
      submitBtn: emailSubmitBtn,
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
    handleUsernameSubmit?.(usernameInput.value.trim(), {
      displayEl: usernameDisplay,
      errorEl: usernameErrorDiv,
      modalEl: usernameModal,
      submitBtn: usernameSubmitBtn,
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
    handlePasswordSubmit?.(passwordNewInput.value.trim(), passwordConfirmInput.value.trim(), {
      errorEl: passwordErrorDiv,
      modalEl: passwordModal,
      submitBtn: passwordSubmitBtn,
    });
  });

  // Return helpers if you want
  return {
    emailDisplay,
    usernameDisplay,
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

export function initReportSidePanel() {
  const reportBtn = document.getElementById('report-btn');
  const sidePanel = document.getElementById('report-side-panel');
  const closePanelBtn = document.getElementById('close-report-panel-btn');

  reportBtn.addEventListener('click', () => {
    sidePanel.classList.toggle('close');
  });

  closePanelBtn.addEventListener('click', () => {
    sidePanel.classList.add('close');
  });
}

// Function to initialize the date picker
export function initReportDatePicker() {
  const dateInput = document.getElementById('report-date-range');
  const panel = document.getElementById('report-side-panel');

  if (!dateInput) return;

  const fp = flatpickr(dateInput, {
    inline: true,
    mode: 'range', // Enables start date -> end date selection
    showMonths: 1, //displays 1 month's calendar at a time
    dateFormat: 'Y-m-d', // Formats date string as YYYY-MM-DD
    maxDate: 'today', // Restricts users from picking future dates for reports

    // Callback fired when dates are selected
    onChange: function (selectedDates, dateStr, instance) {
      // selectedDates is an array of Date objects [startDate, endDate]
      if (selectedDates.length === 2) {
        const startDate = selectedDates[0];
        const endDate = selectedDates[1];

        // console.log('Start Date:', instance.formatDate(startDate, 'Y-m-d'));
        // console.log('End Date:', instance.formatDate(endDate, 'Y-m-d'));
      }
    },
  });

  return fp; // Returns the Flatpickr instance for further control if needed
}
