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
export async function verifyAdminRequest(requestId, isVerified, credentials = null) {
  const requestBody = {
    is_verified: isVerified,
    vmCredentials: credentials
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