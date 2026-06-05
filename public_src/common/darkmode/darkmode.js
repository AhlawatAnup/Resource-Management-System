import * as DarkReader from 'darkreader';

function initDarkMode() {
  const isDark = localStorage.getItem('dark-mode') === 'enabled';

  if (isDark) {
    DarkReader.enable();
  } else {
    DarkReader.disable();
  }
}

function toggleDarkMode() {
  const isDark = localStorage.getItem('dark-mode') === 'enabled';

  if (isDark) {
    DarkReader.disable();
    localStorage.setItem('dark-mode', 'disabled');
  } else {
    DarkReader.enable();
    localStorage.setItem('dark-mode', 'enabled');
  }

  console.log('Current mode:', localStorage.getItem('dark-mode'));
}

export function setupDarkMode() {
  initDarkMode();

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', toggleDarkMode);
  });
}