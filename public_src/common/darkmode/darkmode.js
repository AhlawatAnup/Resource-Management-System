import * as DarkReader from 'darkreader';
// const theme = { mode: 1, brightness: 20, contrast: -10, grayscale: +25, sepia: +20 };
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
}

export function setupDarkMode() {
  initDarkMode();
  DarkReader.enable();
  document.addEventListener('click', (e) => {
    if (e.target.closest('.theme-toggle')) {
      toggleDarkMode();
    }
  });
}
