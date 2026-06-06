import {
  renderReportDetails,
  openReportModal,
  renderStatsChart,
} from './generate-report.ui.js';

export async function generateReport(requestId, request) {

  const res = await fetch(
    `/dashboard/getStatsByResReqId/${requestId}`
  );

  console.log('STATUS:', res.status);

  const data = await res.json();

  console.log('REPORT DATA:', data);

  renderReportDetails(request);
  openReportModal();
  renderStatsChart(data);
}