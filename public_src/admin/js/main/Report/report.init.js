import { initReportDatePicker, initReportSidePanel } from './report.ui';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export async function downloadReport(fromDate, toDate) {
  try {
    // 1. Added `await` AND template literals (backticks) for proper string interpolation
    const response = await fetch(
      `/dashboard/admin/combined-report?from_date=${fromDate}&to_date=${toDate}`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to download report!');
    }

    const payload = data.payload;

    // console.log(payload);

    const htmlTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>U.I.E.T Cloud AI Data Center Usage</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap");

      :root {
        --ink: #14201d;
        --paper: #f4f5f1;
        --paper-raised: #ffffff;
        --line: #d8dcd3;
        --teal: #22705c;
        --teal-dark: #164539;
        --amber: #b8792c;
        --red: #a3402f;
        --dim: #7a827a;
      }

      * {
        box-sizing: border-box;
      }
      html,
      body {
        margin: 0;
        padding: 0;
      }
      body {
        font-family:
          "IBM Plex Sans",
          -apple-system,
          sans-serif;
        background: var(--paper);
        color: var(--ink);
        font-size: 14px;
        line-height: 1.45;
      }
      .mono {
        font-family: "IBM Plex Mono", monospace;
      }
      .dim {
        color: var(--dim);
      }
      .accent-text {
        color: var(--teal-dark);
        font-weight: 600;
      }

      .sheet {
        max-width: 980px;
        margin: 0 auto;
        padding: 40px 36px 60px;
      }

      /* ---------- Masthead ---------- */
      .masthead {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 3px solid var(--ink);
        padding-bottom: 14px;
        margin-bottom: 28px;
      }
      .masthead h1 {
        font-family: "IBM Plex Mono", monospace;
        font-size: 26px;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .masthead .sub {
        color: var(--dim);
        font-size: 12.5px;
        margin-top: 4px;
        font-family: "IBM Plex Mono", monospace;
      }
      .masthead .meta {
        text-align: right;
        font-family: "IBM Plex Mono", monospace;
        font-size: 12px;
        color: var(--dim);
      }
      .masthead .meta strong {
        color: var(--ink);
        display: block;
        font-size: 13px;
      }

      /* ---------- Stat cards ---------- */
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 28px;
      }
      .stat {
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: 3px;
        padding: 14px 16px;
        border-top: 3px solid var(--teal);
      }
      .stat .num {
        font-family: "IBM Plex Mono", monospace;
        font-size: 26px;
        font-weight: 700;
        color: var(--teal-dark);
        line-height: 1;
      }
      .stat .lbl {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--dim);
        margin-top: 6px;
      }

      /* ---------- Section headers ---------- */
      .section-h {
        display: flex;
        align-items: baseline;
        gap: 10px;
        margin: 30px 0 14px;
      }
      .section-h .tag {
        font-family: "IBM Plex Mono", monospace;
        font-size: 11px;
        background: var(--ink);
        color: var(--paper);
        padding: 2px 7px;
        border-radius: 2px;
        letter-spacing: 0.05em;
      }
      .section-h h2 {
        font-size: 16px;
        margin: 0;
        font-weight: 600;
      }
      .section-h .line {
        flex: 1;
        height: 1px;
        background: var(--line);
      }

      /* ---------- Panels row ---------- */
      .panels {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 16px;
      }
      .panel {
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: 3px;
        padding: 16px 18px;
      }
      .panel h3 {
        font-size: 12.5px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--dim);
        margin: 0 0 12px;
      }

      .bar-row {
        display: grid;
        grid-template-columns: 70px 1fr 110px;
        align-items: center;
        gap: 10px;
        margin-bottom: 9px;
        font-size: 12.5px;
      }
      .bar-row.small {
        grid-template-columns: 60px 1fr 40px;
      }
      .bar-label {
        font-family: "IBM Plex Mono", monospace;
        font-weight: 600;
      }
      .bar-track {
        background: #e7e9e3;
        height: 9px;
        border-radius: 5px;
        overflow: hidden;
      }
      .bar-fill {
        background: var(--teal);
        height: 100%;
        border-radius: 5px;
      }
      .bar-fill.accent2 {
        background: var(--amber);
      }
      .bar-value {
        font-family: "IBM Plex Mono", monospace;
        text-align: right;
        font-size: 12px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;
      }
      table th {
        text-align: left;
        font-size: 10.5px;
        text-transform: uppercase;
        color: var(--dim);
        letter-spacing: 0.04em;
        border-bottom: 1px solid var(--line);
        padding: 5px 4px;
      }
      table td {
        padding: 6px 4px;
        border-bottom: 1px solid #eceee7;
      }
      table td.num {
        text-align: right;
        font-family: "IBM Plex Mono", monospace;
      }

      .policy-note {
        font-size: 11.5px;
        color: #3c443f;
        margin-bottom: 12px;
        line-height: 1.6;
      }

      /* ---------- Entries ---------- */
      .entry {
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-radius: 3px;
        padding: 14px 18px 16px;
        margin-bottom: 12px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .entry-head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
      }
      .entry-num {
        font-family: "IBM Plex Mono", monospace;
        font-weight: 700;
        color: var(--teal-dark);
        font-size: 13px;
        background: #e7ede9;
        padding: 2px 7px;
        border-radius: 3px;
      }
      .entry-title {
        font-weight: 600;
        flex: 1;
        font-size: 13.5px;
      }
      .entry-badges {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
      }
      .badge {
        font-family: "IBM Plex Mono", monospace;
        font-size: 9.5px;
        padding: 2px 6px;
        border-radius: 3px;
        letter-spacing: 0.03em;
        white-space: nowrap;
      }
      .badge.good {
        background: #e2f0e6;
        color: var(--teal-dark);
      }
      .badge.bad {
        background: #f3e6e0;
        color: var(--red);
      }

      .entry-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px 18px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .field .k {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--dim);
      }
      .field .v {
        font-size: 12.5px;
        font-weight: 500;
      }
      .field .v .badge {
        margin-right: 5px;
      }
      .field .sub {
        font-size: 11px;
        color: var(--dim);
        font-family: "IBM Plex Mono", monospace;
      }

      .entry-purpose {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed var(--line);
        font-size: 11.5px;
        color: #3c443f;
      }
      .entry-purpose .k {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--dim);
        margin-right: 6px;
      }

      footer {
        margin-top: 40px;
        padding-top: 14px;
        border-top: 1px solid var(--line);
        font-family: "IBM Plex Mono", monospace;
        font-size: 10.5px;
        color: var(--dim);
        display: flex;
        justify-content: space-between;
      }

      .loading-msg {
        padding: 60px 0;
        text-align: center;
        color: var(--dim);
        font-family: "IBM Plex Mono", monospace;
        font-size: 12px;
      }

      @media print {
        body {
          background: white;
        }
        .sheet {
          padding: 10px 6px;
          max-width: 100%;
        }
        .dashboard-page {
          page-break-after: always;
        }
        .entry {
          box-shadow: none;
        }
      }

      @media (max-width: 720px) {
        .stat-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .panels {
          grid-template-columns: 1fr;
        }
        .entry-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="sheet" id="app">
      <div class="loading-msg">Loading report data&hellip;</div>
    </div>

    <!-- DATA SOURCE INJECTED HERE -->
    <script id="report-data" type="application/json">
      __REPORT_PAYLOAD_PLACEHOLDER__
    </script>

    <script>
      (function () {
        const RAW = document.getElementById("report-data").textContent;
        const DATA = JSON.parse(RAW);
        const dash = DATA.dashboard;
        const entries = DATA.entries;

        function esc(s) {
          if (s === null || s === undefined) return "";
          return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        }

        function truncate(s, n) {
          n = n || 280;
          if (!s) return "";
          s = String(s).trim();
          if (s.length <= n) return esc(s);
          return esc(s.slice(0, n).trimEnd()) + "&hellip;";
        }

        function fmtNum(n, digits) {
          if (n === null || n === undefined) return "—";
          return Number(n).toLocaleString(undefined, {
            maximumFractionDigits: digits ?? 0,
          });
        }

        function badge(ok, yes, no) {
          const cls = ok ? "badge good" : "badge bad";
          return \`<span class="\${cls}">\${esc(ok ? yes : no)}</span>\`;
        } 

        // ---------- Build machine usage bars ----------
        function buildMachineBars() {
          const entriesArr = Object.entries(dash.per_machine_hours || {}).sort(
            (a, b) => b[1] - a[1],
          );
          const max = Math.max(1, ...entriesArr.map((e) => e[1]));
          return entriesArr
            .map(([name, hrs]) => {
              const cnt = (dash.per_machine_count || {})[name] || 0;
              const pct = ((hrs / max) * 100).toFixed(1);
              return \`
      <div class="bar-row">
        <div class="bar-label">\${esc(name)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:\${pct}%"></div></div>
        <div class="bar-value">\${fmtNum(hrs)}h <span class="dim">/ \${cnt} req</span></div>
      </div>\`;
            })
            .join("");
        }

        // ---------- Build branch bars ----------
        function buildBranchBars() {
          const entriesArr = Object.entries(dash.per_branch_count || {}).sort(
            (a, b) => b[1] - a[1],
          );
          const max = Math.max(1, ...entriesArr.map((e) => e[1]));
          return entriesArr
            .map(([name, cnt]) => {
              const pct = ((cnt / max) * 100).toFixed(1);
              return \`
      <div class="bar-row small">
        <div class="bar-label">\${esc(String(name).toUpperCase())}</div>
        <div class="bar-track"><div class="bar-fill accent2" style="width:\${pct}%"></div></div>
        <div class="bar-value">\${cnt}</div>
      </div>\`;
            })
            .join("");
        }

        // ---------- Build top students table ----------
        function buildTopStudents() {
          return (dash.top_students || [])
            .map(
              (s) => \`
      <tr><td>\${esc(s.name)}</td><td class="num">\${s.count}</td><td class="num">\${fmtNum(s.hours)}h</td></tr>
    \`,
            )
            .join("");
        }

        // ---------- Build teacher table ----------
        function buildTeacherRows() {
          return Object.entries(dash.per_teacher_count || {})
            .map(
              ([name, cnt]) => \`
      <tr><td>\${esc(name)}</td><td class="num">\${cnt}</td></tr>
    \`,
            )
            .join("");
        }

        // ---------- Build one entry card ----------
        function buildEntryCard(e) {
          const completedBadge = '<span class="badge good">COMPLETED</span>';
          const adminBadge = badge(
            e.admin_verified,
            "ADMIN OK",
            "ADMIN PENDING",
          );
          const teacherBadge = badge(
            e.teacher_verified,
            "TEACHER OK",
            "TEACHER PENDING",
          );
          const usageHours =
            e.usage_hours !== null && e.usage_hours !== undefined
              ? \`\${fmtNum(e.usage_hours, 1)} h\`
              : "—";
          const usageDays =
            e.usage_days !== null && e.usage_days !== undefined
              ? \`\${fmtNum(e.usage_days, 2)} d\`
              : "—";
          const reqDays = e.duration_requested_days ?? "—";
          const gpuRam = e.gpuRam ? \`\${e.gpuRam} GB\` : "—";
          const sysRam = e.ram ? \`\${e.ram} GB\` : "—";

          return \`
    <article class="entry" id="entry-\${e.idx}">
      <div class="entry-head">
        <div class="entry-num">#\${String(e.idx).padStart(2, "0")}</div>
        <div class="entry-title">\${esc(e.title)}</div>
        <div class="entry-badges">\${completedBadge}</div>
      </div>
      <div class="entry-grid">
        <div class="field">
          <span class="k">Student</span>
          <span class="v">\${esc(e.student_name)}</span>
          <span class="sub">\${esc(e.rollNo)} &middot; \${esc(e.branch)} &middot; \${esc(e.student_email)}</span>
        </div>
        <div class="field">
          <span class="k">Teacher</span>
          <span class="v">\${esc(e.teacher_name)}</span>
          <span class="sub">\${esc(e.teacher_email)}</span>
        </div>
        <div class="field">
          <span class="k">Machine</span>
          <span class="v">\${esc(e.machine_name)} <span class="dim">(\${gpuRam} GPU &middot; \${sysRam} RAM)</span></span>
          <span class="sub">\${esc(e.ip)}:\${esc(e.port)}</span>
        </div>
        <div class="field">
          <span class="k">Allotment window</span>
          <span class="v">\${esc(e.start)} &rarr; \${esc(e.end)}</span>
          <span class="sub">requested \${esc(reqDays)} day(s)</span>
        </div>
        <div class="field">
          <span class="k">Actual usage</span>
          <span class="v accent-text">\${usageHours}</span>
          <span class="sub">\${usageDays}</span>
        </div>
        <div class="field">
          <span class="k">Approval</span>
          <span class="v">\${adminBadge}\${teacherBadge}</span>
          <span class="sub">logged \${esc(e.createdAt)} &middot; deleted by \${esc(e.deletedBy)}</span>
        </div>
      </div>
      <div class="entry-purpose"><span class="k">Purpose</span> \${truncate(e.purpose, 320)}</div>
    </article>\`;
        }

        // ---------- Assemble full page ----------
        function render() {
          const verifiedPct = dash.total_requests
            ? Math.round(
                (dash.admin_or_teacher_verified / dash.total_requests) * 100,
              )
            : 0;

          const html = \`
      <div class="dashboard-page">
      <div class="masthead">
        <div>
          <h1>U.I.E.T CLOUD AI DATA CENTER USAGE</h1>
          <div class="sub">completed allotments &middot; tiered approval policy applied &middot; \${esc(dash.date_range_start)} &ndash; \${esc(dash.date_range_end)}</div>
        </div>
        <div class="meta">
          <strong>\${dash.total_requests} qualifying requests</strong>
          \${dash.excluded_count} requests excluded by policy<br>see approval policy below
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat"><div class="num">\${dash.total_requests}</div><div class="lbl">Total Requests</div></div>
        <div class="stat"><div class="num">\${fmtNum(dash.total_hours)}</div><div class="lbl">Total Usage Hours</div></div>
        <div class="stat"><div class="num">\${fmtNum(dash.total_days, 1)}</div><div class="lbl">Total Usage Days</div></div>
        <div class="stat"><div class="num">\${fmtNum(dash.total_teachers)}</div><div class="lbl">Total Teachers</div></div>
        <div class="stat"><div class="num">\${fmtNum(dash.unique_students)}</div><div class="lbl">Active Students</div></div>
        <div class="stat"><div class="num">\${fmtNum(dash.unique_teachers)}</div><div class="lbl">Active Teachers</div></div>
        <div class="stat"><div class="num">\${fmtNum(dash.unique_machines)}</div><div class="lbl">Machines In Use</div></div>
        <div class="stat"><div class="num">\${fmtNum(dash.total_students)}</div><div class="lbl">Total Students</div></div>

        <div class="stat"><div class="num">\${fmtNum(dash.currently_active_req)}</div><div class="lbl">Currently Active Requests</div></div>
        <div class="stat"><div class="num">\${fmtNum(dash.currently_active_hrs)}</div><div class="lbl">Current Request Hours</div></div>
        <div class="stat"><div class="num">\${fmtNum(dash.upcoming_req_count)}</div><div class="lbl">Upcoming Allotments</div></div>
        <div class="stat"><div class="num">99 %</div><div class="lbl">Uptime</div></div>
      </div>

      <div class="section-h"><span class="tag">01</span><h2>Usage Breakdown</h2><div class="line"></div></div>
      <div class="panels">
        <div class="panel">
          <h3>Hours by Machine</h3>
          \${buildMachineBars()}
          <h3 style="margin-top:18px;">Requests by Branch</h3>
          \${buildBranchBars()}
        </div>
        <div class="panel">
          <h3>Top Students by Usage</h3>
          <table>
            <tr><th>Student</th><th class="num">Reqs</th><th class="num">Hours</th></tr>
            \${buildTopStudents()}
          </table>
          <h3 style="margin-top:18px;">Requests by Teacher</h3>
          <table>
            <tr><th>Teacher</th><th class="num">Reqs</th></tr>
            \${buildTeacherRows()}
          </table>
        </div>
      </div>

      <div class="section-h"><span class="tag">02</span><h2>Status Overview</h2><div class="line"></div></div>
      <div class="panels">
        <div class="panel">
          <h3>Approval Policy Applied</h3>
          <div class="policy-note">
            &bull; Raised <b>before 10 Apr 2026</b> &mdash; requires admin approval<br>
            &bull; Raised <b>10 Apr &ndash; 12 Jun 2026</b> &mdash; admin OR teacher approval accepted<br>
            &bull; Raised <b>after 12 Jun 2026</b> &mdash; requires admin approval
          </div>
          <table>
            <tr><td>Approved by admin only</td><td class="num">\${dash.admin_only}</td></tr>
            <tr><td>Approved by teacher only</td><td class="num">\${dash.teacher_only}</td></tr>
            <tr><td>Approved by both</td><td class="num">\${dash.both_verified}</td></tr>
            <tr><td>Excluded (policy not met)</td><td class="num">\${dash.excluded_count}</td></tr>
          </table>
        </div>
        <div class="panel">
          <h3>How usage is measured</h3>
          <div style="font-size:12px; color:#3c443f;">
            Usage hours/days are computed as <span class="mono">endTime &minus; startTime</span> from each entry's
            <span class="mono">machineAllotment</span> window. All entries in this report are completed allotments that
            satisfy the tiered approval policy above, based on the request's raised date. Requests that don't meet the
            required approval for their period are excluded. Detailed per-entry figures follow on the next page.
          </div>
        </div>
      </div>
      </div><!-- /dashboard-page -->

      <div class="section-h"><span class="tag">03</span><h2>Detailed Usage Report For \${dash.total_requests} Allotments</h2><div class="line"></div></div>
      \${entries.map(buildEntryCard).join("")}

      <footer>
        <span>GENERATED FROM U.I.E.T Cloud AI Data Center &middot; \${dash.total_requests} COMPLETED,</span>
        <span>U.I.E.T PANJAB UNIVERSITY &middot; CLOUD AI DATA CENTER</span>
      </footer>
    \`;

          document.getElementById("app").innerHTML = html;
        }

        render();
      })();
    </script>
  </body>
</html>`;

    // Inject returned backend JSON payload into the script tag placeholder
    const fullHtml = htmlTemplate.replace(
      '__REPORT_PAYLOAD_PLACEHOLDER__',
      JSON.stringify(payload, null, 2),
    );

    // Trigger download of the completed HTML file
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `UIET_Cloud_Report_${fromDate}_to_${toDate}.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    console.log('Report HTML file downloaded successfully!');
  } catch (error) {
    console.error('Error generating HTML report:', error);
    alert('Failed to generate report file.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initReportSidePanel();

  const fpInstance = initReportDatePicker();

  const downloadReportBtn = document.getElementById('generateReport');
  if (downloadReportBtn && fpInstance) {
    downloadReportBtn.addEventListener('click', async () => {
      const dates = fpInstance.selectedDates;

      if (dates.length < 2) {
        Toastify({
          text: 'please select complete date range!',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: '#ff6b6b',
        }).showToast();
        return;
      }

      const fromDate = fpInstance.formatDate(dates[0], 'Y-m-d');
      const toDate = fpInstance.formatDate(dates[1], 'Y-m-d');

      await downloadReport(fromDate, toDate);
    });
  }
});
