import '../style/teacher.registration.css';

import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

// import { json } from 'body-parser';
import Swal from 'sweetalert2';

import '../../../common/icons/icons';

import { setupDarkMode } from '../../../common/darkmode/darkmode';

setupDarkMode();
const form = document.getElementById('teacher_registration');
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
    console.log('error in registering teacher: ', e);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    Toastify({
      text: 'Something went wrong',
      duration: 3000,
      gravity: 'top',
      position: 'center',
      backgroundColor: '#ff6b6b',
    }).showToast();
  }
});
