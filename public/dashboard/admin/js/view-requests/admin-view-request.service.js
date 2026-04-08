// Fetch all resource requests (admin)
export async function fetchAdminResourceRequests() {
  const response = await fetch("/dashboard/admin/resource-requests", {
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


// Verify (approve/decline) request with optional credentials
export async function verifyAdminRequest(requestId, isVerified, remarks = "") {
  const requestBody = {
    is_verified: isVerified,
    remarks: remarks
  };

  const response = await fetch(`/dashboard/admin/verify_request/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorMessage = 'Failed to update request verification';

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result;
}

// Fetch available machines
export async function fetchAvailableMachines() {
  const response = await fetch('/dashboard/admin/machines', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to load machines');
  }

  const data = await response.json();
  return data.machines || [];
}

// Revoke a resource request (admin)
export async function revokeStudentRequest(requestId) {
  const res = await fetch(`/dashboard/admin/revoke/${requestId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Failed to revoke request');
  }
  return res.json();
}

export async function extendStudentRequest(requestId, extraDuration) {
  const res = await fetch(`/dashboard/admin/edit-resourceRequest/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extraDuration })
  });

  const data = await res.json(); // parse JSON response

  if (!res.ok) {
    throw new Error(data.message || 'Failed to extend request');
  }

  return data;
}