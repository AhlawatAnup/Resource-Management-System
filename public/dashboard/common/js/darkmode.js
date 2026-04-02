function configureDarkReaderFetch() {
  if (typeof DarkReader?.setFetchMethod === "function" && typeof window.fetch === "function") {
    DarkReader.setFetchMethod(window.fetch.bind(window));
  }
}

function syncToggleButtonState() {
  const button = document.getElementById("dark-mode-toggle");
  if (!button) return;

  button.textContent = DarkReader.isEnabled() ? "Light" : "Dark";
  button.setAttribute("aria-label", DarkReader.isEnabled() ? "Switch to light mode" : "Switch to dark mode");
}

function ensureDarkModeToggleButton() {
  if (document.getElementById("dark-mode-toggle")) return;

  const existingToggle = document.querySelector("[data-darkmode-toggle], [onclick*='toggleDarkMode']");
  if (existingToggle) {
    if (!existingToggle.hasAttribute("data-darkmode-bound")) {
      existingToggle.setAttribute("data-darkmode-bound", "true");
      existingToggle.addEventListener("click", function () {
        setTimeout(syncToggleButtonState, 0);
      });
    }
    return;
  }

  const button = document.createElement("button");
  button.id = "dark-mode-toggle";
  button.type = "button";
  button.style.position = "fixed";
  button.style.left = "16px";
  button.style.bottom = "16px";
  button.style.zIndex = "9999";
  button.style.padding = "10px 14px";
  button.style.border = "none";
  button.style.borderRadius = "999px";
  button.style.cursor = "pointer";
  button.style.fontWeight = "600";
  button.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
  button.style.background = "#111827";
  button.style.color = "#f9fafb";

  button.addEventListener("click", toggleDarkMode);
  document.body.appendChild(button);
  syncToggleButtonState();
}

// Apply saved preference on page load
(function () {
  configureDarkReaderFetch();
  const saved = localStorage.getItem("dark-mode");

  if (saved === "enabled") {
    DarkReader.enable({
      brightness: 100,
      contrast: 90,
      sepia: 10
    });
  } else if (saved === "disabled") {
    DarkReader.disable();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureDarkModeToggleButton);
  } else {
    ensureDarkModeToggleButton();
  }
})();

// Toggle function
function toggleDarkMode() {
  configureDarkReaderFetch();

  if (DarkReader.isEnabled()) {
    DarkReader.disable();
    localStorage.setItem("dark-mode", "disabled");
  } else {
    DarkReader.enable({
      brightness: 100,
      contrast: 90,
      sepia: 10
    });
    localStorage.setItem("dark-mode", "enabled");
  }

  syncToggleButtonState();
}