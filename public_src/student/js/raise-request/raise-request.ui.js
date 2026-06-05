// ui.js

import { showConfirmationPopup } from './confirmation-popup.js';

export function renderMachineCards(machines){
    const container = document.getElementById('raise-machines-flexbar');
    

    container.innerHTML = machines
      .map(
        (machine) =>
            `<div   class="machine-bar-item"
  data-machine-id="${machine._id}" 
  style="
  border-bottom: 1px solid #e5e7eb;
  padding: 20px;
  margin: 8px;
  flex-shrink: 0;
">

  <p style="
    font-size: 14px;
    font-weight: 400;
    color: #111827;
    margin: 0 0 18px 0;
  ">
    ${machine.MIGID}
  </p>

  <div style="
    display: flex;
    align-items: center;
    gap: 28px;
    flex-wrap: nowrap;
  ">

    <!-- GPU -->
    <div style="display:flex; align-items:center; gap:10px;">

      <div style="
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #e8f5e9;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-shrink:0;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#43a047" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <rect x="9" y="9" width="6" height="6"/>
          <line x1="9" y1="2" x2="9" y2="4"/>
          <line x1="15" y1="2" x2="15" y2="4"/>
          <line x1="9" y1="20" x2="9" y2="22"/>
          <line x1="15" y1="20" x2="15" y2="22"/>
          <line x1="2" y1="9" x2="4" y2="9"/>
          <line x1="2" y1="15" x2="4" y2="15"/>
          <line x1="20" y1="9" x2="22" y2="9"/>
          <line x1="20" y1="15" x2="22" y2="15"/>
        </svg>
      </div>

      <div>
        <p style="
          font-size: 12px;
          color: #6b7280;
          margin:0;
          white-space: nowrap;
        ">
          GPU RAM
        </p>

        <p style="
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          margin:0;
        ">
          ${machine.gpuRam}GB
        </p>
      </div>

    </div>

    <!-- RAM -->
    <div style="display:flex; align-items:center; gap:10px;">

      <div style="
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #e3f2fd;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-shrink:0;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e88e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/>
        </svg>
      </div>

      <div>
        <p style="
          font-size: 12px;
          color: #6b7280;
          margin:0;
          white-space: nowrap;
        ">
          RAM
        </p>

        <p style="
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          margin:0;
        ">
          ${machine.ram}GB
        </p>
      </div>

    </div>

    <!-- Available -->
    <div style="display:flex; align-items:center; gap:10px;">

      <div style="
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #ede7f6;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-shrink:0;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7e57c2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>

      <div>
        <p style="
          font-size: 12px;
          color: #6b7280;
          margin:0;
          white-space: nowrap;
        ">
          Available From
        </p>

        <p style="
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          margin:0;
        ">
          ${machine.availableFrom}
        </p>
      </div>

    </div>

  </div>

</div>`,
      )
      .join('');

}

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
  const bannerKey = `verified-banner-dismissed-${student._id}`;

  const bannerDismissed = localStorage.getItem(bannerKey) === 'true';

  if (!bannerDismissed) {
    banner.style.display = 'flex';

    bannerText.textContent =
      'Welcome! You are verified and eligible to request resources';

    bannerIcon.className = 'fas fa-check-circle';

    closeBtn.style.display = 'block';

    closeBtn.onclick = () => {
      banner.style.display = 'none';

      localStorage.setItem(bannerKey, 'true');
    };
  } else {
    banner.style.display = 'none';
  }

  verifiedSection.style.display = 'block';
  unverifiedSection.style.display = 'none';

  banner.classList.remove('unverified-banner');
  banner.classList.add('verified-banner');

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
