import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { setupDarkMode } from '../../../../common/darkmode/darkmode';

// SETTING CONFIG OF ADMIN PANEL ACCESSIBILITY
async function setConfig(configParam, element) {
  //   console.log(element);
  //   console.log(element.checked);

  try {
    const response = await fetch('/dashboard/admin/update-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: configParam, value: element.checked }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update configuration.');
    }

    Toastify({
      text: 'Configuration updated successfully!',
      duration: 2500,
      gravity: 'bottom',
      position: 'right',
      style: { background: '#4CAF50' },
    }).showToast();
  } catch (error) {
    // Revert toggle state on failure
    element.checked = !value;

    Toastify({
      text: error.message,
      duration: 3000,
      gravity: 'bottom',
      position: 'right',
      style: { background: '#ff6b6b' },
    }).showToast();
  }
}

//GETTING CONFIG VALUES FOR DISPLAY
const configForm = document.getElementById('config-options-container');
async function getConfigValues() {
  try {
    const response = await fetch('/dashboard/admin/get-config');
    if (response.ok) {
      const data = await response.json();
      const config = data.config || {};

      //   PARSE CONFIG

      // Loop through all checkboxes inside the config form and set their state
      const toggles = configForm.querySelectorAll('input[type="checkbox"]');
      toggles.forEach((toggle) => {
        const key = toggle.dataset.key; // e.g., data-key="resource_request_mail"
        if (key && config[key] !== undefined) {
          toggle.checked = !!config[key];
        }
      });
    }
  } catch (err) {
    console.error('Failed to fetch config:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  getConfigValues();
});

window.setConfig = setConfig;
