import { createAllotmentsHandler } from "./allotments.handler.js";
import { createMachineService, detectRoleFromPath } from "./allotments.service.js";
import { handleLogout } from '../commons.js';  //for html logout
import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';

function initAllotments() {
  setupDarkMode();
  const role = detectRoleFromPath();
  if (!role) {
    console.error("Allotments init aborted: role could not be detected from URL");
    return;
  }

  const machineService = createMachineService(role);
  const handler = createAllotmentsHandler(machineService);
  handler.init();
}

document.addEventListener("DOMContentLoaded", initAllotments);
