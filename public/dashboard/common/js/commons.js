// Render dashboard header for any role
export function renderDashboardHeader(data) {
  const header = document.getElementById("hello-user");
  if (!header) return;
  
  const welcomeText = `Hello, ${data.name || 'User'}`;
  const roleText = data.role ? ` | ${data.role}` : '';
  
  header.innerHTML = `${welcomeText}${roleText}`;
}

// Export other utility functions as needed
export function getInitials(fullName) {
  if (!fullName) return "";
  return fullName
    .split(" ")
    .filter((word) => word)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function getRandomNamedColor() {
  const colors = ["blue", "green", "orange", "purple", "pink"];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

function getBadgeClass(leadSource) {
  const source = leadSource.toLowerCase().replace(/\s+/g, "-");
  return `badge ${source}`;
}

// Common utility functions that can be used by any role
export function formatDate(dateString) {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Purpose Panel Functionality - Reusable across all portals
export function showPurposePanel(event, requestId, purpose, panelWidth = 600, panelHeight = 300) {
  const panel = document.getElementById('purposePanel');
  const textarea = document.getElementById('purposeText');
  const button = event.target;
  
  // Set the purpose text
  textarea.value = purpose;
  
  // Get button position
  const buttonRect = button.getBoundingClientRect();
  
  // Set the panel dimensions explicitly
  panel.style.width = panelWidth + 'px';
  panel.style.height = panelHeight + 'px';
  
  // Calculate position (to the right and slightly down from the button)
  let left = buttonRect.right + 10; // 10px gap from button
  let top = buttonRect.top;
  
  // Adjust if panel would go off-screen
  if (left + panelWidth > window.innerWidth) {
    left = buttonRect.left - panelWidth - 10; // Show to the left instead
  }
  
  if (top + panelHeight > window.innerHeight) {
    top = window.innerHeight - panelHeight - 20; // Adjust to fit in viewport
  }
  
  // Position and show the panel
  panel.style.left = left + 'px';
  panel.style.top = top + 'px';
  panel.style.display = 'block';
  
  // Close panel when clicking outside
  setTimeout(() => {
    document.addEventListener('click', closePanelOnOutsideClick);
  }, 100);
}

export function closePurposePanel() {
  const panel = document.getElementById('purposePanel');
  panel.style.display = 'none';
  document.removeEventListener('click', closePanelOnOutsideClick);
}

export function closePanelOnOutsideClick(event) {
  const panel = document.getElementById('purposePanel');
  if (!panel.contains(event.target) && !event.target.classList.contains('view-more-btn')) {
    closePurposePanel();
  }
}

// Initialize purpose panel event listeners
export function initializePurposePanel() {
  // Handle escape key to close panel
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closePurposePanel();
    }
  });

  // Make functions globally available for HTML onclick handlers
  window.showPurposePanel = showPurposePanel;
  window.closePurposePanel = closePurposePanel;
}

// Generate purpose panel HTML structure
export function createPurposePanelHTML() {
  return `
    <!-- Purpose View Panel -->
    <div id="purposePanel" class="purpose-panel">
      <div class="purpose-panel-header">
        <span class="purpose-panel-title">Request Purpose</span>
        <button class="purpose-panel-close" onclick="closePurposePanel()">&times;</button>
      </div>
      <div class="purpose-panel-body">
        <textarea id="purposeText" readonly></textarea>
      </div>
    </div>
  `;
}

// Generate "View More" button for purpose text
export function createViewMoreButton(requestId, purpose) {
  const escapedPurpose = purpose.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  return `<button class="view-more-btn" onclick="showPurposePanel(event, '${requestId}', \`${escapedPurpose}\`)">View More</button>`;
}

// Username validation utility
export function isValidUsername(username) {
  return /^[A-Za-z0-9_-]+$/.test(username);
}