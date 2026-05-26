import {
  fetchAdminResourceRequests,
  fetchAvailableMachines,
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
  mergeUpdatedRequest,
} from './admin-view-request.utils.js';

import { getInitials, getRandomNamedColor, formatDate } from '../../../common/js/commons.js';

// import {initAdminRefresh} from'../pushNotifications-refreshUI/admin-refresh.js'

// ===== STATE =====
let currentStatus = 'all';

let resourceRequests = [];
let filteredRequests = [];

let upcomingRequests = [];
let activeRequests = [];
let expiredRequests = [];
let rejectedRequests = [];
let statsChart = null;

function getUIStatus(r) {
  const now = new Date();

  // Any rejection (teacher OR admin)
  if ((r.teacher_action && !r.teacher_verified) || (r.admin_action && !r.admin_verified)) {
    return 'rejected';
  }

  // Fully approved
  if (r.teacher_verified || r.admin_verified) {
    if (r.startTime && r.endTime) {
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);

      if (now < start) return 'upcoming'; // not started yet
      if (now >= start && now <= end) return 'active'; // currently running
      if (now > end) return 'expired'; // finished
    }

    //Fallback if no time exists
    return 'active';
  }

  //Still waiting for approvals
  return 'active';
}

// ===== LOAD =====
export async function loadRequestsHandler() {
  try {
    const { error, data } = await fetchAdminResourceRequests();

    if (error) throw new Error();

    // Flatten status object into top-level for each request
    resourceRequests = (data.requests || []).map((r) => {
      if (r.status && typeof r.status === 'object') {
        return { ...r, ...r.status };
      }
      return r;
    });
    upcomingRequests = [];
    expiredRequests = [];
    rejectedRequests = [];
    activeRequests = [];

    resourceRequests.forEach((r) => {
      const status = getUIStatus(r);

      if (status === 'upcoming') upcomingRequests.push(r);
      else if (status === 'active') activeRequests.push(r);
      else if (status === 'expired') expiredRequests.push(r);
      else if (status === 'rejected') rejectedRequests.push(r);
    });
    filteredRequests = [...resourceRequests];

    render();
  } catch (err) {
    console.error(err);
    showErrorState();
  }
}

export function setStatusFilter(status) {
  currentStatus = status;
  render();
}

// ===== RENDER =====
function render() {
  let baseData = [];

  if (currentStatus === 'all') baseData = resourceRequests;
  else if (currentStatus === 'upcoming') baseData = upcomingRequests;
  else if (currentStatus === 'expired') baseData = expiredRequests;
  else if (currentStatus === 'rejected') baseData = rejectedRequests;
  else if (currentStatus === 'active') baseData = activeRequests;

  // apply search on selected set
  const data = filterRequestsList(baseData, document.getElementById('searchInput')?.value || '');
  document.getElementById('all-count').textContent = resourceRequests.length;

  document.getElementById('active-count').textContent = activeRequests.length;

  document.getElementById('upcoming-count').textContent = upcomingRequests.length;

  document.getElementById('expired-count').textContent = expiredRequests.length;

  document.getElementById('rejected-count').textContent = rejectedRequests.length;

  renderResourceRequests(data, {
    getRequestStatus,
    getActionButtons,
    getInitials,
    getRandomNamedColor,
    formatDate,
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
  const status = getUIStatus(r);
  const isPending = !r.teacher_verified && !r.admin_verified;

  // EXPIRED → only report
  if (status === 'expired') {
    return `
      <button class="icon-btn stats-report-btn" data-request-id="${r._id}">
        <i class="fa fa-bar-chart"></i>
      </button>
    `;
  }

  // UPCOMING → edit + revoke
  if (status === 'upcoming') {
    return `
      <button class="icon-btn edit-btn" data-request-id="${r._id}">
        <i class="fas fa-pen-to-square"></i>
      </button>

      <button class="icon-btn revoke-btn" data-request-id="${r._id}">
        Revoke
      </button>
    `;
  }

  //  ACTIVE → all 3
  if (status === 'active') {
    return `
       ${
         isPending
           ? `
        <button class="icon-btn approve-btn" data-request-id="${r._id}" data-action='approve'>
          
        </button>
      `
           : ''
       }
       ${
         isPending
           ? `<button class="icon-btn decline-btn" data-request-id="${r._id}" data-action='decline'>
      
         </button>`
           : ``
       }
      <button class="icon-btn edit-btn" data-request-id="${r._id}">
        <i class="fas fa-pen-to-square"></i>
      </button>
      ${
        !isPending
          ? `<button class="icon-btn revoke-btn" data-request-id="${r._id}">
        Revoke
      </button>`
          : ``
      }
       ${
         !isPending
           ? `<button class="icon-btn stats-report-btn" data-request-id="${r._id}">
        <i class="fa fa-bar-chart"></i>
      </button>`
           : ``
       }
      
    `;
  }

  return '';
}

// ===== EDIT =====
export function handleEditClick(requestId) {
  const request = resourceRequests.find((r) => r._id === requestId);
  if (!request) return;

  openEditModal(request);
}

export function getRequestById(requestId) {
  return resourceRequests.find((r) => r._id === requestId);
}

export function renderReportDetails(request) {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  if (!request) {
    setText('reportStudentName', '-');
    setText('reportRollNo', '-');
    setText('reportMigId', '-');
    setText('reportDuration', '-');
    setText('reportStartTime', '-');
    setText('reportEndTime', '-');
    return;
  }

  const duration = Number.isFinite(request.duration)
    ? `${request.duration} day${request.duration > 1 ? 's' : ''}`
    : '-';

  setText('reportStudentName', request.studentName || '-');
  setText('reportRollNo', request.rollNo || '-');
  setText('reportMigId', request.migId || '-');
  setText('reportDuration', duration);
  setText('reportStartTime', request.startTime ? formatDate(request.startTime) : '-');
  setText('reportEndTime', request.endTime ? formatDate(request.endTime) : '-');
}

export function openReportModal() {
  const modal = document.getElementById('reportModal');
  modal.classList.remove('hidden');

  setTimeout(() => {
    if (statsChart) {
      statsChart.resize();
    }
  }, 200);
}

export function closeReportModal() {
  document.getElementById('reportModal').classList.add('hidden');
}

export function renderStatsChart(apiResponse) {
  const getISTDayKey = (value) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(value));

  const formatISTDayLabel = (value) =>
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
    }).format(new Date(value));

  const labels = apiResponse.data.map((d) => new Date(d.timestamp));
  const ctx = document.getElementById('reportChart').getContext('2d');
  const gradientCPU = ctx.createLinearGradient(0, 0, 0, 400);

  gradientCPU.addColorStop(0, 'rgba(132,204,22,0.045)');
  gradientCPU.addColorStop(1, 'rgba(132,204,22,0)');

  const gradientMemory = ctx.createLinearGradient(0, 0, 0, 400);

  gradientMemory.addColorStop(0, 'rgba(14,165,233,0.14)');
  gradientMemory.addColorStop(1, 'rgba(14,165,233,0)');

  const gradientGPU = ctx.createLinearGradient(0, 0, 0, 400);

  gradientGPU.addColorStop(0, 'rgba(249,115,22,0.14)');
  gradientGPU.addColorStop(1, 'rgba(249,115,22,0)');
  const chartData = {
    labels,
    datasets: [
      {
        label: 'CPU %',

        data: apiResponse.data.map((d) => Math.min(d.cpu, 100)),

        borderColor: '#84CC16',

        backgroundColor: gradientCPU,
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointRadius:  (ctx) => ctx.raw >= 100 ? 0 : 3,
        pointHoverRadius: (ctx) => ctx.raw >= 100 ? 0 : 6,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#84CC16',
        pointHoverBackgroundColor: '#84CC16',
        pointHoverBorderColor: '#ffffff',
        pointHitRadius: 18,
        shadowColor: 'rgba(132,204,22,0.45)',
      },
      {
        label: 'Memory %',
        data: apiResponse.data.map((d) => Math.min(d.mem, 100)),
        borderColor: '#0EA5E9',
        backgroundColor: gradientMemory,
        fill: false,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: (ctx) => ctx.raw >= 100 ? 0 : 3,
        pointHoverRadius:  (ctx) => ctx.raw >= 100 ? 0 : 6,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0EA5E9',
        pointHoverBackgroundColor: '#0EA5E9',
        pointHoverBorderColor: '#ffffff',
        pointHitRadius: 18,
        shadowColor: 'rgba(14,165,233,0.45)',
      },
      {
        label: 'GPU %',
        data: apiResponse.data.map((d) => Math.min(d.gpu, 100)),
        borderColor: '#F97316',
        backgroundColor: gradientGPU,
        fill: false,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: (ctx) => ctx.raw >= 100 ? 0 : 3,
        pointHoverRadius: (ctx) => ctx.raw >= 100 ? 0 : 6,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#F97316',
        pointHoverBackgroundColor: '#F97316',
        pointHoverBorderColor: '#ffffff',
        pointHitRadius: 18,
        shadowColor: 'rgba(249,115,22,0.45)',
      },
    ],
  };
  Chart.defaults.elements.line.borderJoinStyle = 'round';
  Chart.defaults.elements.line.borderCapStyle = 'round';

  const glowLinePlugin = {
    id: 'glowLinePlugin',

    beforeDatasetDraw(chart, args) {
      const { ctx } = chart;

      ctx.save();

      ctx.shadowBlur = 4;

      ctx.shadowColor = chart.data.datasets[args.index].shadowColor;

      ctx.shadowOffsetX = 0;

      ctx.shadowOffsetY = 0;
    },

    afterDatasetDraw(chart) {
      chart.ctx.restore();
    },
  };

  const config = {
    type: 'line',
    plugins: [glowLinePlugin],
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { bottom: 8 },
      },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        title: { display: false },
        decimation: { enabled: false },
      },
      scales: {
        x: {
          type: 'time',
          grid: {
            color: 'rgba(127,127,127,0.10)',
            drawBorder: false,
            tickLength: 0,
          },
          time: { unit: 'day' },
          ticks: {
            padding: 8,
            maxRotation: 0,
            callback: (value, index, ticks) => {
              const currentDay = getISTDayKey(value);
              if (index === 0) {
                return formatISTDayLabel(value);
              }

              const previousDay = getISTDayKey(ticks[index - 1].value);
              return currentDay !== previousDay ? formatISTDayLabel(value) : '';
            },
          },
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(127,127,127,0.10)',
            drawBorder: false,
            tickLength: 0,
          },
          title: {
            display: true,
            text: 'Utilization (%)',
          },
        },
      },
    },
  };

  if (statsChart) {
    statsChart.destroy();
  }

  statsChart = new Chart(ctx, config);
  setupLegendToggle();
  function setupLegendToggle() {
    const legendMap = [
      { selector: '.cpu-pill', datasetIndex: 0 },
      { selector: '.memory-pill', datasetIndex: 1 },
      { selector: '.gpu-pill', datasetIndex: 2 },
    ];

    legendMap.forEach(({ selector, datasetIndex }) => {
      const btn = document.querySelector(selector);

      if (!btn) return;

      btn.onclick = () => {
        const meta = statsChart.getDatasetMeta(datasetIndex);

        // toggle visibility
        meta.hidden = meta.hidden === null ? true : !meta.hidden;

        // toggle cut style
        btn.classList.toggle('disabled', meta.hidden);

        statsChart.update();
      };
    });
  }
}

// initAdminRefresh(loadRequestsHandler);
