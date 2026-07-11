import('../style/student.registration.css');

import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import Swal from 'sweetalert2';
import { setupDarkMode } from '../../../common/darkmode/darkmode';

setupDarkMode();

import '../../../common/icons/icons';

const assignedTeacherSelect = document.getElementById('assignedTeacher');
async function loadTeachers() {
  try {
    const res = await fetch('/auth/get-teachers');
    const data = await res.json();

    console.log(data);
    assignedTeacherSelect.innerHTML = `<option value="">Select a Teacher</option>`;

    if (data.teachers && data.teachers.length > 0) {
      data.teachers.forEach((t) => {
        const option = document.createElement('option');
        option.value = t._id;
        option.textContent = t.name;
        assignedTeacherSelect.appendChild(option);
      });
    } else {
      // No verified teachers available
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No verified teachers available';
      option.disabled = true;
      assignedTeacherSelect.appendChild(option);

      // Show a message to the user
      const teacherFormGroup = assignedTeacherSelect.closest('.form-group');
      if (teacherFormGroup && !teacherFormGroup.querySelector('.no-teachers-message')) {
        const message = document.createElement('div');
        message.className = 'no-teachers-message';
        message.style.cssText =
          'color: #dc2626; font-size: 12px; margin-top: 5px; font-style: italic;';
        message.textContent =
          'No verified teachers are currently available. Please contact the administration.';
        teacherFormGroup.appendChild(message);
      }
    }
  } catch (err) {
    console.error('Failed to load teachers', err);
    // Show error in the dropdown
    assignedTeacherSelect.innerHTML = '<option value="">Error loading teachers</option>';
  }
}

window.addEventListener('DOMContentLoaded', loadTeachers);

const form = document.getElementById('student_registration');
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-Btn');

  // Disable button and show loading state
  submitBtn.disabled = true;
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Signing up...';

  const name = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const branch = document.getElementById('branch').value;
  const instituteName = document.getElementById('instituteName').value.trim();
  const instituteAddress = document.getElementById('instituteAddress').value.trim();
  const assignedTeacher = document.getElementById('assignedTeacher').value;
  const rollNo = document.getElementById('rollNo').value.trim();

  if (!/^[a-zA-Z\s.]+$/.test(name)) {
    console.log(name);
    Toastify({
      text: 'Name should only contain letters and spaces.',
      duration: 3000,
      gravity: 'top',
      position: 'center',
      backgroundColor: '#ff6b6b',
    }).showToast();
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    Toastify({
      text: 'Please enter a valid 10-digit phone number.',
      duration: 3000,
      gravity: 'top',
      position: 'center',
      backgroundColor: '#ff6b6b',
    }).showToast();
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    return;
  }

  try {
    const payload = {
      name: name,
      phone: phone,
      branch: branch,
      instituteName: instituteName,
      instituteAddress: instituteAddress,
      teacher_id: assignedTeacher,
      rollNo: rollNo,
    };

    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Redirecting to dashboard....',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = '/dashboard';
      });
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      Toastify({
        text: data.error || 'Registration failed',
        duration: 3000,
        gravity: 'top',
        position: 'center',
        backgroundColor: '#ff6b6b',
      }).showToast();
    }
  } catch (e) {
    console.log('error in registering student: ', e);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    // Toastify({
    //   text: 'Something went wrong',
    //   duration: 3000,
    //   gravity: 'top',
    //   position: 'center',
    //   backgroundColor: '#ff6b6b',
    // }).showToast();
  }
});
