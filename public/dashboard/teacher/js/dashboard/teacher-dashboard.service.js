// Fetch teacher dashboard data
export async function fetchTeacherDashboardData() {
  const response = await fetch('/dashboard/teacher/data', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

// Fetch individual student data
export async function fetchStudentData(stu_id) {
  const response = await fetch('/dashboard/teacher/student_data/' + stu_id, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

// Update student verification
export async function updateStudentVerificationAPI(studentId, isVerified) {
  const response = await fetch(`/dashboard/teacher/verify_student/${studentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_verified: isVerified }),
  });

  return response;
}
