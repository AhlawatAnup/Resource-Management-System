import { getStudentVerificationStatus, getStudentStatusClass } from '../student.util.js';

import { formatDate } from '../../../common/utils/commons.utils.js';

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
    welcomeElement.textContent = `Welcome, ${student.name}`;
  }

  // Update student profile section
  const profileSection = document.getElementById('student-profile');
  if (profileSection) {
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
       <h3>12</h3>
       <p> Total Requests</p> 
       <p class='tag'>Raised by you</p>
      </div>

        <div class="hero-stat">
       <div class="hero-stat-icon machines-icon"> 
        <i class="fas fa-desktop"></i> 
        </div> 
        <h3>3</h3> 
        <p>Machines Alotments</p>
        <p class='tag'>All Time</p>


         </div> <div class="hero-stat">
          <div class="hero-stat-icon availability-icon">
           <i class="fas fa-chart-line"></i> 
           </div> 
           <h3>5</h3> 
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

      <a href="/dashboard"
         class="hero-btn primary">
        Raise New Request
      </a>

      <a href="/dashboard"
         class="hero-btn secondary">
        View My Requests
      </a>

    </div>

  </div>
</div>
</div>
 
   `;
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
