// services/profileService.js

export async function fetchAdminProfile() {
  const res = await fetch('/dashboard/admin/details');
  return res.json();
}

export async function updateEmail(newEmail) {
  const res = await fetch('/dashboard/admin/update-profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newEmail })
  });
  return res.json();
}

export async function updateUsername(newUsername) {
  const res = await fetch('/dashboard/admin/update-profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newUsername })
  });
  return res.json();
}

export async function changePassword(newPassword) {
  const res = await fetch('/dashboard/admin/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword })
  });
  return res.json();
}