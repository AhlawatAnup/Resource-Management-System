import { formatDate } from '../utils/commons.utils.js';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

let statsChart = null;
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
        pointRadius: (ctx) => (ctx.raw >= 100 ? 0 : 3),
        pointHoverRadius: (ctx) => (ctx.raw >= 100 ? 0 : 6),
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
        pointRadius: (ctx) => (ctx.raw >= 100 ? 0 : 3),
        pointHoverRadius: (ctx) => (ctx.raw >= 100 ? 0 : 6),
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
        pointRadius: (ctx) => (ctx.raw >= 100 ? 0 : 3),
        pointHoverRadius: (ctx) => (ctx.raw >= 100 ? 0 : 6),
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
