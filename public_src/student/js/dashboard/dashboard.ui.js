// import { getStudentVerificationStatus, getStudentStatusClass } from '../student.util.js';
// import { formatDate } from '../../../common/utils/commons.utils.js';
// import { setActiveSidebar } from '../../../common/aside/aside.js';
import { CountUp } from 'countup.js';
import { add_svg, audio_waveform_svg } from '../../../common/icons/icons.svg.js';
import { student } from '../student.init.js';
import { setActiveSidebar } from '../../../common/aside/aside.js';

// DOM SELCETORS
const profile = document.querySelector('.main.dashboard .profile');
const profileLeft = profile.querySelector('.left');
const profileRight = profile.querySelector('.right');

const leftSpan = profileLeft.querySelectorAll('span');
const profileRightValue = profileRight.querySelectorAll('.value');

const profileRightBtns = profileRight.querySelectorAll('button');

const rating = profileLeft.querySelector('.rating .stars');

export function showErrorMessage(message, containerId = 'student-profile') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="retry-btn" onclick="this.disabled=true; location.reload()">Retry</button>
            </div>
        `;
  }
}

export function showLoadingState(containerId = 'student-profile') {
  return;
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
  }
}

// DISPLAY STUDENT DETAILS
export function displayStudentDetails() {
  leftSpan[0].innerText =
    student.name.split(' ')[0].charAt(0) + '.' + student.name.split(' ')[1].charAt(0); // student.name.charAt(0).toUpperCase();
  leftSpan[1].innerText = student.name;
  leftSpan[2].innerText = student.email;

  leftSpan[3].innerText = student.verificationStatus;
  leftSpan[3].dataset.status = student.verificationCode;

  rating.style = '--rating:' + Number(student.resourceUtilizationScore);
  rating.nextElementSibling.innerText = Number(student.resourceUtilizationScore).toFixed(1) + '/5';

  // RIGHT SIDE UI
  profileRightValue[0].innerText = new Date(student.createdAt).toLocaleString();
  profileRightValue[1].innerText = student.branch.toUpperCase();
  profileRightValue[2].innerText = student.rollNo;
  profileRightValue[3].innerText = student.teacher?.name;
  profileRightValue[4].innerText = student.resourceRequests.length;

  profileRightValue[6].innerText = student.instituteName ?? 'NA';

  profileRightBtns[0].addEventListener('click', () => {
    document.querySelectorAll('aside nav a')[1].click();
  });

  profileRightBtns[1].addEventListener('click', () => {
    document.querySelectorAll('aside nav a')[2].click();
  });

  return;
  document.getElementById('resourceRequestsBtn')?.addEventListener('click', () => {
    document.querySelector('.dashboard-page')?.classList.add('hide-default');

    document.querySelector('.raise-request')?.classList.remove('hide-default');

    document.querySelector('a[data-page="raise-request"]')?.click();
  });

  document.getElementById('viewRequestsBtn')?.addEventListener('click', () => {
    document.querySelector('.dashboard-page')?.classList.add('hide-default');

    document.querySelector('.view-request')?.classList.remove('hide-default');

    document.querySelector('a[data-page="view-request"]')?.click();
  });

  // const stats = document.querySelector('.stats-outer');
  // if (stats) {
  //   stats.innerHTML = `
  //   <div class="stat-card">
  //   <div class="accent-bar bar-blue"></div>
  //   <div class="card-top">
  //     <div class="icon-wrap icon-blue"><i class="fa fa-paper-plane" aria-hidden="true"></i></div>
  //     <span class="badge badge-blue">All time</span>
  //   </div>
  //   <div>
  //     <div class="stat-number">8</div>
  //     <div class="stat-label">Total requests raised</div>
  //   </div>
  //   <div class="card-footer">
  //     <i class="fa fa-history" aria-hidden="true"></i>
  //     Across all semesters
  //   </div>
  // </div>

  // <div class="stat-card">
  //   <div class="accent-bar bar-green"></div>
  //   <div class="card-top">
  //     <div class="icon-wrap icon-green"><i class="fa fa-check-circle" aria-hidden="true"></i></div>
  //     <span class="badge badge-green">All time</span>
  //   </div>
  //   <div>
  //     <div class="stat-number">5</div>
  //     <div class="stat-label">Allotted requests all time</div>
  //   </div>
  //   <div class="card-footer">
  //     <i class="fa fa-server" aria-hidden="true"></i>
  //     Successfully allotted
  //   </div>
  // </div>

  // <div class="stat-card">
  //   <div class="accent-bar bar-amber"></div>
  //   <div class="card-top">
  //     <div class="icon-wrap icon-amber"><i class="fa fa-desktop" aria-hidden="true"></i></div>
  //     <span class="badge badge-amber">Live</span>
  //   </div>
  //   <div>
  //     <div class="stat-number">12</div>
  //     <div class="stat-label">Machines available</div>
  //   </div>
  //   <div class="card-footer">
  //     <i class="fa fa-circle" style="color:#639922; font-size:8px;" aria-hidden="true"></i>
  //     Updated just now
  //   </div>
  // </div>

  //   `;
  // }

  //   if (!profileSection) {
  //     profileSection.innerHTML = `
  //    <div class="dashboard-hero">

  //   <!-- TOP ROW -->
  //   <div class="hero-top">

  //     <div class="hero-left">

  //       <div class="hero-avatar">
  //         ${student.name.charAt(0).toUpperCase()}
  //       </div>

  //       <div class="hero-info">

  //         <span class="hero-welcome">
  //           Welcome back 👋
  //         </span>

  //         <h2 class="hero-name">
  //           ${student.name}
  //         </h2>

  //         <p class="hero-meta">
  //           ${student.branch}
  //           <span>•</span>
  //           ${student.instituteName}
  //           <span>•</span>
  //           ${student.instituteAddress}
  //         </p>

  //         <div class="hero-badges">

  //           <span class="verified-badge ${statusClass}">
  //             ${verificationStatus}
  //           </span>

  //           <span class="roll-badge">
  //             Roll No: ${student.rollNo}
  //           </span>

  //         </div>

  //       </div>

  //     </div>

  //     <div class="hero-right">

  //       <div class="hero-stat">
  //       <div class="hero-stat-icon requests-icon">
  //        <i class="fas fa-file-alt"></i>
  //        </div>
  //        <h3 id="totalRequests">0</h3>
  //        <p> Total Requests</p>
  //        <p class='tag'>Raised by you</p>
  //       </div>

  //         <div class="hero-stat">
  //        <div class="hero-stat-icon machines-icon">
  //         <i class="fas fa-desktop"></i>
  //         </div>
  //         <h3 id='allottedRequests'>0</h3>
  //         <p>Alotted Requests</p>
  //         <p class='tag'>All Time</p>

  //          </div> <div class="hero-stat">
  //           <div class="hero-stat-icon availability-icon">
  //            <i class="fas fa-chart-line"></i>
  //            </div>
  //            <h3 id='availableMachines'>0</h3>
  //            <p>Machine Available</p>
  //            <p class='tag'>This Time</p>
  //            </div>
  //     </div>

  //     </div>

  //   <!-- BOTTOM ROW -->
  //   <div class="hero-bottom">

  //     <div class="hero-teacher">
  //       <i class="fas fa-user-tie"></i>
  //       Faculty Teacher: ${student.teacher?.name}
  //     </div>

  //     <div class="hero-actions">
  //       <button   id="resourceRequestsBtn">
  //                Raise New Request
  //       </button>

  //       <button id='viewRequestsBtn'>
  //               View My Requests
  //       </button>

  //     </div>

  //   </div>
  // </div>
  // </div>

  //    `;

  //     new CountUp('totalRequests', student.dashboardStats?.totalRequests || 0).start();

  //     new CountUp('allottedRequests', student.dashboardStats?.allottedRequests || 0).start();

  //     new CountUp('availableMachines', student.dashboardStats?.availableMachines || 0).start();

  //     document.getElementById('resourceRequestsBtn')?.addEventListener('click', () => {
  //       document.querySelector('.dashboard-page')?.classList.add('hide-default');

  //       document.querySelector('.raise-request')?.classList.remove('hide-default');

  //       document.querySelector('a[data-page="raise-request"]')?.click();
  //     });

  //     document.getElementById('viewRequestsBtn')?.addEventListener('click', () => {
  //       document.querySelector('.dashboard-page')?.classList.add('hide-default');

  //       document.querySelector('.view-request')?.classList.remove('hide-default');

  //       document.querySelector('a[data-page="view-request"]')?.click();
  //     });
  //   }
}

export function updateDashboardElements() {
  const elements = document.querySelectorAll('[data-student-name]');
  elements.forEach((element) => {
    element.textContent = student.name;
  });

  const idElements = document.querySelectorAll('[data-student-id]');
  idElements.forEach((element) => {
    element.textContent = student.id;
  });
}

student.addEventListener('student_ready', () => {
  displayStudentDetails();
  updateDashboardElements();
});
