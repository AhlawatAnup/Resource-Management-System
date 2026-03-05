import { setupSWEventDispatcher } from "../../../common/js/sw-events.js";

export function initAdminRefresh(loadResourceRequests) {

  // safe to call multiple times
  setupSWEventDispatcher();

  window.addEventListener("sw-message", (e) => {

    if (e.detail?.type === "ADMIN-RESOURCE_REQUEST_UPDATED") {
      console.log("[admin-refresh] refreshing resource requests");

      loadResourceRequests();
    }

  });
}