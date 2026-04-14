import {
  loadRequestsHandler,
  filterHandler,
  copyHandler,
  getRequestById,
} from './admin-view-request.handler.js';
import { verifyAdminRequest, revokeStudentRequest, extendStudentRequest } from './admin-view-request.service.js';
import { generatePassword, confirmAction, showToast , getEditDurationInput, closeEditModal, getRejectionRemarks} from './admin-view-request.utils.js';
import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';
import { openEditModal } from './admin-view-request.ui.js';

document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  loadRequestsHandler();

  let statsChart = null;

  // search
  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    filterHandler(e.target.value);
  });

  // table actions
  document.getElementById("requestsTableBody")?.addEventListener("click", async (e) => {
    const approveDeclineBtn = e.target.closest('.approve-btn, .decline-btn');
    const revokeBtn = e.target.closest('.revoke-btn');
    const editBtn = e.target.closest('.edit-btn');
    const reportBtn = e.target.closest('.stats-report-btn');

    // Approve/Decline
    if (approveDeclineBtn) {
      const id = approveDeclineBtn.dataset.requestId;
      const action = approveDeclineBtn.dataset.action;
      if (!id || !action) return;

      try {
        let remarks = "";

        if (action === "decline") {
          const result = await getRejectionRemarks();
          if (result === null) return;
          remarks = result;
        } else {
          const confirmed = await confirmAction(action);
          if (!confirmed) return;
        }

        await verifyAdminRequest(id, action === 'approve', remarks);
        await loadRequestsHandler();

        showToast(`Request ${action}d successfully!`, 'success');
      } catch (err) {
        showToast(err.message || 'Failed to update request', 'error');
      }

      return;
    }

    // Revoke
    if (revokeBtn) {
      const id = revokeBtn.dataset.requestId;
      if (!id) return;
      try {
        const confirmed = await confirmAction('revoke');
        if (!confirmed) return;
        await revokeStudentRequest(id);
        await loadRequestsHandler();
        showToast('Request revoked successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to revoke request', 'error');
      }
      return;
    }

    // Edit
    if (editBtn) {
      const id = editBtn.dataset.requestId;
      if (!id) return;

      const request = getRequestById(id);
      if (!request) return; 

      openEditModal(request);

      document.getElementById('editSubmitBtn').onclick = async () => {
        const extend = getEditDurationInput();
        if (!extend) {
          showToast('Enter a valid positive number of days', 'error');
          return;
        }

        try {
          const result = await extendStudentRequest(id, extend);
          closeEditModal();
          await loadRequestsHandler();
          showToast(result.message || 'Request extended successfully', 'success');
        } catch (err) {
          showToast(err.message || 'Failed to extend request', 'error');
        }
      };

      return;
    }

    if (reportBtn) {
      const requestId = reportBtn.dataset.requestId;
      if (!requestId) return;

      try {
        showToast("Generating report...", "success");

        const res = await fetch(
          `/dashboard/admin/getStatsByResReqId/${requestId}`,
          {
            method: "GET",
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch report data");
        }

        const data = await res.json();

        openReportModal();

        renderStatsChart(data);

      } catch (err) {
        showToast(err.message || "Failed to generate report", "error");
      }

      return;
    }
  });

  function openReportModal() {
    const modal = document.getElementById("reportModal");
    modal.classList.remove("hidden");

    setTimeout(() => {
      if (statsChart) {
        statsChart.resize();
      }
    }, 200);
  }

  function closeReportModal() {
    document.getElementById("reportModal").classList.add("hidden");
  }

  function renderStatsChart(apiResponse) {
    const getISTDayKey = (value) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(value));

    const formatISTDayLabel = (value) =>
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
      }).format(new Date(value));

    const labels = apiResponse.data.map((d) => new Date(d.timestamp));

    const chartData = {
      labels,
      datasets: [
        {
          label: "CPU %",
          data: apiResponse.data.map((d) => d.cpu),
          borderColor: "red",
          tension: 0.3,
        },
        {
          label: "Memory %",
          data: apiResponse.data.map((d) => d.mem),
          borderColor: "blue",
          tension: 0.3,
        },
        {
          label: "GPU %",
          data: apiResponse.data.map((d) => d.gpu),
          borderColor: "green",
          tension: 0.3,
        },
      ],
    };

    const config = {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { bottom: 8 },
        },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Machine Usage (%)" },
          decimation: { enabled: false },
        },
        scales: {
          x: {
            type: "time",
            time: { unit: "day" },
            ticks: {
              padding: 8,
              maxRotation: 0,
              callback: (value, index, ticks) => {
                const currentDay = getISTDayKey(value);
                if (index === 0) {
                  return formatISTDayLabel(value);
                }

                const previousDay = getISTDayKey(ticks[index - 1].value);
                return currentDay !== previousDay
                  ? formatISTDayLabel(value)
                  : "";
              },
            },
            title: {
              display: true,
              text: "Time",
            },
          },
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: "Utilization (%)",
            },
          },
        },
      },
    };

    const ctx = document.getElementById("reportChart").getContext("2d");

    if (statsChart) {
      statsChart.destroy();
    }

    statsChart = new Chart(ctx, config);
  }

  document.getElementById("closeReportBtn")?.addEventListener("click", () => {
    closeReportModal();
  });

  // copy
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    copyHandler(btn.dataset.target);
  });

  // generate password
  document.getElementById('generateVmPasswordBtn')?.addEventListener('click', () => {
    const pwd = generatePassword(12);
    const pwdEl = document.getElementById('vmPassword');
    if (pwdEl) pwdEl.value = pwd;
  });

});