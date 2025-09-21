// Render dashboard header for any role
function renderDashboardHeader(data) {
  const header = document.getElementById("hello-user");
  if (!header) return;
  header.innerHTML = `Hello, ${data.name} | ${data.role}`;
}
