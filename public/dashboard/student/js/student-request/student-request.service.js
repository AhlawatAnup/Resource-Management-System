// service.js

export async function fetchStudentData(studentId) {
  const response = await fetch(`/dashboard/student/student_data/${studentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

export async function submitResourceRequest(data) {
  const response = await fetch('/dashboard/student/submit-resource-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
}
