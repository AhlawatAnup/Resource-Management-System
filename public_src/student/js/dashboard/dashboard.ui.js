import { getStudentVerificationStatus, getStudentStatusClass } from '../student.util.js';
import { formatDate } from '../../../common/utils/commons.utils.js';
import { setActiveSidebar } from '../../../common/aside/aside.js';
import { CountUp } from 'countup.js';

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

export function displayStudentDetails(student) {
  const verificationStatus = getStudentVerificationStatus(student);
  const statusClass = getStudentStatusClass(student);

  // Update student name in header/welcome section
  const welcomeElement = document.getElementById('student-welcome');
  if (welcomeElement) {
    welcomeElement.textContent = `Hello, ${student.name} | ${student.rollNo}`;
  }

  // Update student profile section
  const profileSection = document.getElementById('student-profile');
  if (profileSection) {
    profileSection.innerHTML = `
    <div class='profile-card'>
     <div style='display:flex; justify-content: space-between; width:100%'>
       <div class='profile-header'>
         <div class="profile-avatar">
        ${student.name.charAt(0).toUpperCase()}
         </div>

          <h2 class="profile-name">
          ${student.name}
        </h2>

        <span class="verification-badge ${statusClass}">
            ${verificationStatus}
          </span>
       </div>
          <button  class="theme-toggle" title="Dark Mode" style='margin-top:6px; margin-bottom:6px'>
          <i id="theme-icon" class="fa fa-moon"></i>
        </button>
         </div>
       
       <div class='profile-details-row'>
         <span><strong>Email:</strong>${student.email || 'N/A'}</span>
         <span><strong>Branch:</strong>${student.branch || 'N/A'}</span>
         <span><strong>Institute Address:</strong>${student.instituteName ?? 'NA'}, ${student.instituteAddress ?? 'NA'}</span>
         <span><strong>Roll No.:</strong>${student.rollNo}</span>
         <span><strong>Joined:</strong>${student.createdAt.toLocaleString().split('T')[0]}</span>
       </div>

       <!-- BOTTOM ROW -->
  <div class="hero-bottom">


    <div class="hero-teacher">
      Under the supervision of: ${student.teacher?.name}
    </div>

    <div class="rms-button rms-action-primary">

      <button   id="resourceRequestsBtn">
        
        Raise New Request
      </button>

      <button
          id='viewRequestsBtn'> 
        View My Requests
      </button>

    </div>

  </div>
</div>
</div>
    </div>

    `;

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
  }

  const stats = document.querySelector('.stats-outer');
  if (stats) {
    stats.innerHTML = `
    <div class="stat-card">
    <div class="accent-bar bar-blue"></div>
    <div class="card-top">
      <div class="icon-wrap icon-blue"><i class="fa fa-paper-plane" aria-hidden="true"></i></div>
      <span class="badge badge-blue">All time</span>
    </div>
    <div>
      <div class="stat-number">8</div>
      <div class="stat-label">Total requests raised</div>
    </div>
    <div class="card-footer">
      <i class="fa fa-history" aria-hidden="true"></i>
      Across all semesters
    </div>
  </div>

  <div class="stat-card">
    <div class="accent-bar bar-green"></div>
    <div class="card-top">
      <div class="icon-wrap icon-green"><i class="fa fa-check-circle" aria-hidden="true"></i></div>
      <span class="badge badge-green">All time</span>
    </div>
    <div>
      <div class="stat-number">5</div>
      <div class="stat-label">Allotted requests all time</div>
    </div>
    <div class="card-footer">
      <i class="fa fa-server" aria-hidden="true"></i>
      Successfully allotted
    </div>
  </div>

  <div class="stat-card">
    <div class="accent-bar bar-amber"></div>
    <div class="card-top">
      <div class="icon-wrap icon-amber"><i class="fa fa-desktop" aria-hidden="true"></i></div>
      <span class="badge badge-amber">Live</span>
    </div>
    <div>
      <div class="stat-number">12</div>
      <div class="stat-label">Machines available</div>
    </div>
    <div class="card-footer">
      <i class="fa fa-circle" style="color:#639922; font-size:8px;" aria-hidden="true"></i>
      Updated just now
    </div>
  </div>



    `;
  }

  if (!profileSection) {
    profileSection.innerHTML = `
   <div class="dashboard-hero">

  <!-- TOP ROW -->
  <div class="hero-top">

    <div class="hero-left">

      <div class="hero-avatar">
        ${student.name.charAt(0).toUpperCase()}
      </div>

      <div class="hero-info">

        <span class="hero-welcome">
          Welcome back 👋
        </span>

        <h2 class="hero-name">
          ${student.name}
        </h2>

        <p class="hero-meta">
          ${student.branch}
          <span>•</span>
          ${student.instituteName}
          <span>•</span>
          ${student.instituteAddress}
        </p>

        <div class="hero-badges">

          <span class="verified-badge ${statusClass}">
            ${verificationStatus}
          </span>

          <span class="roll-badge">
            Roll No: ${student.rollNo}
          </span>

        </div>

      </div>

    </div>

    <div class="hero-right">

      <div class="hero-stat"> 
      <div class="hero-stat-icon requests-icon">
       <i class="fas fa-file-alt"></i> 
       </div> 
       <h3 id="totalRequests">0</h3>
       <p> Total Requests</p> 
       <p class='tag'>Raised by you</p>
      </div>

        <div class="hero-stat">
       <div class="hero-stat-icon machines-icon"> 
        <i class="fas fa-desktop"></i> 
        </div> 
        <h3 id='allottedRequests'>0</h3> 
        <p>Alotted Requests</p>
        <p class='tag'>All Time</p>


         </div> <div class="hero-stat">
          <div class="hero-stat-icon availability-icon">
           <i class="fas fa-chart-line"></i> 
           </div> 
           <h3 id='availableMachines'>0</h3> 
           <p>Machine Available</p> 
           <p class='tag'>This Time</p>
           </div> 
    </div>

    </div>

  

  <!-- BOTTOM ROW -->
  <div class="hero-bottom">

    <div class="hero-teacher">
      <i class="fas fa-user-tie"></i>
      Faculty Teacher: ${student.teacher?.name}
    </div>

    <div class="hero-actions">

      <button   id="resourceRequestsBtn">
        
        Raise New Request
      </button>

      <button
          id='viewRequestsBtn'> 
        View My Requests
      </button>

    </div>

  </div>
</div>
</div>
 
   `;

    new CountUp('totalRequests', student.dashboardStats?.totalRequests || 0).start();

    new CountUp('allottedRequests', student.dashboardStats?.allottedRequests || 0).start();

    new CountUp('availableMachines', student.dashboardStats?.availableMachines || 0).start();

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
  }
}

export function updateDashboardElements(student) {
  const elements = document.querySelectorAll('[data-student-name]');
  elements.forEach((element) => {
    element.textContent = student.name;
  });

  const idElements = document.querySelectorAll('[data-student-id]');
  idElements.forEach((element) => {
    element.textContent = student.studentId || student._id;
  });
}
