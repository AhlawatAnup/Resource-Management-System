import {
  fetchAdminResourceRequests,
  fetchAvailableMachines
} from './admin-view-request.service.js';

import {
  renderResourceRequests,
  showEmptyState,
  showErrorState,
  showNotification,
  populateMachinesSelectUI,
  setSubmitButtonState,
  setFieldError,
  copyToClipboard,
  openEditModal,
} from './admin-view-request.ui.js';

import {
  getRequestStatus,
  filterRequestsList,
  mergeUpdatedRequest
} from './admin-view-request.utils.js'

import {
  getInitials,
  getRandomNamedColor,
  formatDate
} from '../../../common/js/commons.js';

// import {initAdminRefresh} from'../pushNotifications-refreshUI/admin-refresh.js'

// ===== STATE =====
let resourceRequests = [];
let filteredRequests = [];
let statsChart = null;


// ===== LOAD =====
export async function loadRequestsHandler() {
  try {
    const { error, data } = await fetchAdminResourceRequests();

    if (error) throw new Error();


    // Flatten status object into top-level for each request
    resourceRequests = (data.requests || []).map(r => {
      if (r.status && typeof r.status === 'object') {
        return { ...r, ...r.status };
      }
      return r;
    });
    filteredRequests = [...resourceRequests];

    render();

  } catch (err) {
    console.error(err);
    showErrorState();
  }
}


// ===== RENDER =====
function render() {
  renderResourceRequests(filteredRequests, {
    getRequestStatus,
    getActionButtons,
    getInitials,
    getRandomNamedColor,
    formatDate
  });
}


// ===== FILTER =====
export function filterHandler(term) {
  if (!resourceRequests.length) {
    showEmptyState();
    return;
  }

  filteredRequests = filterRequestsList(resourceRequests, term);
  render();
}

// ===== COPY =====
export async function copyHandler(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return showNotification('Not found', 'error');

  const value = el.value || '';
  if (!value) return showNotification('Nothing to copy', 'error');

  try {
    await copyToClipboard(value);
    showNotification('Copied', 'success');
  } catch {
    showNotification('Copy failed', 'error');
  }
}


function getActionButtons(r) {
  const status = getRequestStatus(r);

  if (status.class === 'declined') {
    return '';
  }

  if (status.class === 'expired') {
    return `
      <button class="icon-btn stats-report-btn" data-request-id="${r._id}">
        <i class="fa fa-bar-chart"></i>
      </button>
    `;
  }

  // VERIFIED
  if (status.class === 'verified') {
    return `
      <button class="icon-btn edit-btn" data-request-id="${r._id}" title="Edit">
        <i class="fas fa-pen-to-square"></i>
      </button>
  
      <button title="Revoke student's access from machine" class="icon-btn revoke-btn" data-request-id="${r._id}">
        Revoke
      </button>

      <button title="Machine usage report" class="icon-btn stats-report-btn" data-request-id="${r._id}">
       <i class="fa fa-bar-chart"></i>
      </button>
    `;
  }

  // PENDING TEACHER
  if (status.class === 'pending-teacher') {
    return `
      <button class="icon-btn approve-btn" data-request-id="${r._id}" data-action="approve" title="Approve">
        <i class="fas fa-check"></i>
      </button>

      <button class="icon-btn decline-btn" data-request-id="${r._id}" data-action="decline" title="Decline">
        <i class="fas fa-times"></i>
      </button>
    `;
  }
  return '';
}

// ===== EDIT =====
export function handleEditClick(requestId) {
  const request = resourceRequests.find(r => r._id === requestId);
  if (!request) return;

  openEditModal(request);
}

export function getRequestById(requestId) {
  return resourceRequests.find(r => r._id === requestId);
}

export function renderReportDetails(request) {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  if (!request) {
    setText("reportStudentName", "-");
    setText("reportRollNo", "-");
    setText("reportMigId", "-");
    setText("reportDuration", "-");
    setText("reportStartTime", "-");
    setText("reportEndTime", "-");
    return;
  }

  const duration = Number.isFinite(request.duration)
    ? `${request.duration} day${request.duration > 1 ? "s" : ""}`
    : "-";

  setText("reportStudentName", request.studentName || "-");
  setText("reportRollNo", request.rollNo || "-");
  setText("reportMigId", request.migId || "-");
  setText("reportDuration", duration);
  setText("reportStartTime", request.startTime ? formatDate(request.startTime) : "-");
  setText("reportEndTime", request.endTime ? formatDate(request.endTime) : "-");
}

export function openReportModal() {
  const modal = document.getElementById("reportModal");
  modal.classList.remove("hidden");

  setTimeout(() => {
    if (statsChart) {
      statsChart.resize();
    }
  }, 200);
}

export function closeReportModal() {
  document.getElementById("reportModal").classList.add("hidden");
}

export function renderStatsChart(apiResponse) {
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

// initAdminRefresh(loadRequestsHandler);