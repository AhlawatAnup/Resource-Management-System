// service.js

// -----------------------------
// Fetch Dashboard Data
// -----------------------------
export async function fetchDashboardData(endpoint, { logout }) {
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      if (response.status === 404) {
        logout();
        return null;
      }

      throw new Error(`Failed to load dashboard data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    logout();
    return null;
  }
}

// -----------------------------
// Verify Teacher
// -----------------------------
export async function verifyTeacherService(teacherId, isVerified) {
  const response = await fetch(`/dashboard/admin/verify_teacher/${teacherId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_verified: isVerified }),
  });

  return response;
}

// -----------------------------
// Verify Student
// -----------------------------
export async function verifyStudentService(studentId, isVerified) {
  const response = await fetch(`/dashboard/admin/verify_student/${studentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_verified: isVerified }),
  });

  return response;
}

// -----------------------------
// Unverify Student
// -----------------------------
export async function unverifyStudentService(studentId) {
  const response = await fetch(`/dashboard/admin/unverify_student/${studentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

// -----------------------------
// Unverify Teacher
// -----------------------------
export async function unverifyTeacherService(teacherId) {
  const response = await fetch(`/dashboard/admin/unverify_teacher/${teacherId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}
