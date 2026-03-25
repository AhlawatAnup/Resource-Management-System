// Get request status (ADMIN version - includes teacher + admin states)
export function getRequestStatus(request) {
  if (request.teacher_verified && request.admin_verified) {
    return { text: "Approved", class: "verified" };

  } else if (request.admin_action && !request.admin_verified) {
    return { text: "Declined by Admin", class: "declined" };

  } else if (request.teacher_action && !request.teacher_verified) {
    return { text: "Declined by Teacher", class: "declined" };

  } else if (request.teacher_verified && !request.admin_action) {
    return { text: "Pending Admin", class: "pending-admin" };

  } else if (!request.teacher_action) {
    return { text: "Pending Teacher", class: "pending-teacher" };

  } else {
    return { text: "Pending", class: "pending" };
  }
}


// Filter requests (pure function)
export function filterRequestsList(requests, searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return [...requests];
  }

  const term = searchTerm.toLowerCase();

  return requests.filter((request) =>
    request.studentInfo?.name?.toLowerCase().includes(term) ||
    request.studentInfo?.rollNo?.toLowerCase().includes(term) ||
    request.teacherInfo?.name?.toLowerCase().includes(term) ||
    request.title?.toLowerCase().includes(term) ||
    request.purpose?.toLowerCase().includes(term)
  );
}


// Merge updated request safely (preserve missing nested data)
export function mergeUpdatedRequest(oldRequest, updatedRequest) {
  const merged = { ...updatedRequest };

  if (!merged.studentInfo && oldRequest.studentInfo) {
    merged.studentInfo = oldRequest.studentInfo;
  }

  if (!merged.teacherInfo && oldRequest.teacherInfo) {
    merged.teacherInfo = oldRequest.teacherInfo;
  }

  return merged;
}


// Generate a secure random password
export function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$&';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}
