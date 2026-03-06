// Fetch resource requests from teacher dashboard
export async function fetchResourceRequests() {
  const response = await fetch("/dashboard/teacher/data", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return { error: true, status: response.status };
  }

  const data = await response.json();

  return {
    error: false,
    data
  };
}

// Update request verification (approve/decline)
export async function verifyRequest(requestId, isVerified) {
  const response = await fetch(`/dashboard/teacher/verify_request/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ is_verified: isVerified })
  });

  let result = null;

  try {
    result = await response.json();
  } catch (e) {
    // keep behavior same (handled in caller)
  }

  return {
    ok: response.ok,
    data: result
  };
}

// Submit edited request
export async function editRequest(requestId, payload) {
  const response = await fetch(`/dashboard/teacher/edit_request/${requestId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let result;

  try {
    result = await response.json();
  } catch (jsonErr) {
    throw new Error('Invalid server response');
  }

  if (!response.ok || !result.success) {
    const errorMsg = result && result.error ? result.error : 'Failed to edit request';
    throw new Error(errorMsg);
  }

  return result;
}