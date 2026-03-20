const ALLOWED_ROLES = new Set(["student", "teacher", "admin"]);

function normalizeRole(role) {
  if (typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase();
  return ALLOWED_ROLES.has(normalized) ? normalized : null;
}

export function detectRoleFromPath(pathname = window.location.pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const dashboardIndex = segments.indexOf("dashboard");
  if (dashboardIndex === -1 || dashboardIndex + 1 >= segments.length) {
    return null;
  }
  return normalizeRole(segments[dashboardIndex + 1]);
}

export function createMachineService(role) {
  const safeRole = normalizeRole(role);
  if (!safeRole) {
    throw new Error("Invalid or unsupported dashboard role");
  }

  const basePath = `/dashboard/${safeRole}`;

  return {
    async getMachines() {
      const response = await fetch(`${basePath}/get_machines`);
      if (!response.ok) throw new Error("Failed to fetch machines");
      return response.json();
    },

    async getAllotments(machineId) {
      const safeMachineId = encodeURIComponent(String(machineId));
      const response = await fetch(`${basePath}/allotments/${safeMachineId}`);
      if (!response.ok) throw new Error("Failed to fetch allotments");
      return response.json();
    }
  };
}
