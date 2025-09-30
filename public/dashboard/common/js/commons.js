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
        month: 'long',
        day: 'numeric'
    });
}