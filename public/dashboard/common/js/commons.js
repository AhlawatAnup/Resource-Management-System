// Render dashboard header for any role
export function renderDashboardHeader(data) {
  const header = document.getElementById("hello-user");
  if (!header) return;
  header.innerHTML = `Hello, ${data.name} | ${data.role}`;
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