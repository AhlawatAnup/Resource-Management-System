// darkmode.js

function configureDarkReaderFetch() {
  if (typeof DarkReader?.setFetchMethod === "function" && typeof window.fetch === "function") {
    DarkReader.setFetchMethod(window.fetch.bind(window));
  }
}

function initDarkMode() {
  configureDarkReaderFetch();

  const saved = localStorage.getItem("dark-mode");

  if (saved === "enabled") {
    DarkReader.enable();
  } else {
    DarkReader.disable();
  }
}

function toggleDarkMode() {
  configureDarkReaderFetch();

  if (DarkReader.isEnabled()) {
    DarkReader.disable();
    localStorage.setItem("dark-mode", "disabled");
  } else {
    DarkReader.enable();
    localStorage.setItem("dark-mode", "enabled");
  }
}

// ✅ Single public function
export function setupDarkMode() {
  initDarkMode();

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", toggleDarkMode);
  }
}