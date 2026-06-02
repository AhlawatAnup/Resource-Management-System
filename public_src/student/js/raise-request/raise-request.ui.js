// ui.js

import { showConfirmationPopup } from './confirmation-popup.js';

export function renderResourcesPage(student, verificationStatus, onSubmitHandler) {
  const banner = document.getElementById('verification-banner');
  const bannerText = document.getElementById('banner-text');
  const bannerIcon = document.getElementById('banner-icon');
  const closeBtn = document.getElementById('close-verification-banner');
  if (!banner || !bannerText || !bannerIcon || !closeBtn) {
    console.error('Banner elements missing');
    return;
  }

  const isVerified = student.teacher_verified && student.admin_verified;

  const loadingSection = document.getElementById('loading-section');
  const verifiedSection = document.getElementById('verified-section');
  const unverifiedSection = document.getElementById('unverified-section');

  if (!verifiedSection || !unverifiedSection) return;

  // Hide loading
  if (loadingSection) loadingSection.style.display = 'none';

  if (isVerified) {
    banner.style.display = 'flex';

    bannerText.textContent = 'Welcome! You are verified and eligible to request resources';

    bannerIcon.className = 'fas fa-check-circle';

    closeBtn.style.display = 'block';

    closeBtn.onclick = () => {
      banner.style.display = 'none';
    };
    verifiedSection.style.display = 'block';
    unverifiedSection.style.display = 'none';
    banner.classList.remove('unverified-banner');
    banner.classList.add('verified-banner');

    // Attach submit handler - show confirmation popup first
    const form = document.getElementById('resource-request-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const purposeField = document.getElementById('purpose');
        const purpose = purposeField ? purposeField.value : '';
        showConfirmationPopup(onSubmitHandler, e, student, purpose);
      });
    }
  } else {
    banner.style.display = 'flex';

    bannerText.textContent = `Verification Required - ${verificationStatus}`;

    bannerIcon.className = 'fas fa-exclamation-circle';

    closeBtn.style.display = 'none';

    verifiedSection.style.display = 'none';
    unverifiedSection.style.display = 'block';
    banner.classList.remove('verified-banner');
    banner.classList.add('unverified-banner');
    // Populate verification status text
    const statusText = document.getElementById('verification-status-text');
    const statusDetail = document.getElementById('verification-status-detail');
    if (statusText) statusText.textContent = verificationStatus;
    if (statusDetail) statusDetail.textContent = verificationStatus;
  }
}

// Notifications (UI only)
export function showErrorNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff4d4f, #ff7875);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
        z-index: 1000;
        font-weight: 600;
    `;
  notification.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>${message}`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

export function showSuccessMessage(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        font-weight: 600;
    `;
  notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i>${message}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}
