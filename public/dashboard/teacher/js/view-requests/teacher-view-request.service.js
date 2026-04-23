// Fetch resource requests from teacher dashboard
export async function fetchResourceRequests() {
  const response = await fetch('/dashboard/teacher/data', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { error: true, status: response.status };
  }

  const data = await response.json();

  return {
    error: false,
    data,
  };
}

// Update request verification (approve/decline)
export async function verifyRequest(requestId, isVerified) {
  const response = await fetch(`/dashboard/teacher/verify_request/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_verified: isVerified }),
  });

  let result = null;

  try {
    result = await response.json();
  } catch (e) {
    // keep behavior same (handled in caller)
  }

  return {
    ok: response.ok,
    data: result,
  };
}
