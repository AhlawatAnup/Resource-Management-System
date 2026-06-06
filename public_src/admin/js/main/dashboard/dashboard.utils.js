// utils.js

// -----------------------------
// Endpoint Resolver
// -----------------------------
export function getEndpoint(currentType, currentStatus) {
  if (currentType === 'teacher') {
    if (currentStatus === 0) return '/dashboard/admin/teachers/pending';
    if (currentStatus === 1) return '/dashboard/admin/teachers';
    if (currentStatus === 3) return '/dashboard/admin/teachers/rejected';
    if (currentStatus === 2) return '/dashboard/admin/teachers';
  } else {
    if (currentStatus === 0) return '/dashboard/admin/students/pending';
    if (currentStatus === 1) return '/dashboard/admin/students';
    if (currentStatus === 3) return '/dashboard/admin/students/rejected';
    if (currentStatus === 2) return '/dashboard/admin/students';
  }

  return '';
}

// -----------------------------
// Data Extraction Logic
// -----------------------------
export function extractDataByTypeAndStatus(data, currentType, currentStatus) {
  if (currentType === 'teacher') {
    if (currentStatus === 0) {
      return data.teachers || [];
    }
    if (currentStatus === 1) {
      return (data.teachers || []).filter((t) => t.is_verified);
    }
    if (currentStatus === 3) {
      return data.teachers || [];
    }
    if (currentStatus === 2) {
      return data.teachers || [];
    }
  } else {
    if (currentStatus === 0) {
      return data.students || [];
    }
    if (currentStatus === 1) {
      return (data.students || []).filter((s) => s.is_verified);
    }
    if (currentStatus === 3) {
      return data.students || [];
    }
    if (currentStatus === 2) {
      return data.students || [];
    }
  }

  return [];
}

// -----------------------------
// Header Config
// -----------------------------
export function getTableHeaders(currentType, currentStatus) {
  if (currentType === 'teacher') {
    if (currentStatus === 'unverified') {
      return ['Name', 'Email', 'Phone', 'Branch', 'Actions'];
    }
    return ['Name', 'Email', 'Phone', 'Branch', 'Students', 'Status', 'Actions'];
  } else {
    return [
      'Name',
      'Email',
      'Phone',
      'Branch',
      'Roll No',
      'Teacher',
      'Institute',
      'Status',
      'Actions',
    ];
  }
}

// -----------------------------
// Page Header Content
// -----------------------------
export function getPageHeaderContent(currentType, currentStatus) {
  const typeText = currentType === 'teacher' ? 'Teachers' : 'Students';

  let statusText = '';
  let subtitleText = '';

  if (currentStatus === 'all') {
    statusText = 'All';
    subtitleText = `Manage all ${currentType} records`;
  } else if (currentStatus === 'unverified') {
    statusText = 'Unverified';
    subtitleText = `Manage ${currentType} verification requests`;
  } else if (currentStatus === 'rejected') {
    statusText = 'Rejected';
    subtitleText = `View ${currentType}s rejected by admin or teacher`;
  } else {
    statusText = 'Verified';
    subtitleText = `Manage verified ${currentType} records`;
  }

  return {
    title: `${statusText} ${typeText}`,
    subtitle: subtitleText,
    countLabel: statusText,
  };
}

// -----------------------------
// Empty State Message
// -----------------------------
export function getEmptyMessage(currentType, currentStatus) {
  if (currentStatus === 'all') {
    return `No ${currentType}s found`;
  }
  if (currentStatus === 'unverified') {
    return `No pending ${currentType} verifications`;
  }
  if (currentStatus === 'rejected') {
    return `No rejected ${currentType}s found`;
  }
  return `No verified ${currentType}s found`;
}

// -----------------------------
// Student Status Resolver
// -----------------------------
export function getStudentStatus(student) {
  if (!student.teacher_action) {
    return { text: 'Pending on Teacher', class: 'status-pending' };
  }
  if (!student.teacher_verified) {
    return { text: 'Rejected by Teacher', class: 'status-rejected' };
  }
  if (!student.admin_action) {
    return { text: 'Pending on Admin', class: 'status-pending' };
  }
  if (!student.admin_verified) {
    return { text: 'Rejected by Admin', class: 'status-rejected' };
  }
  return { text: 'Verified', class: 'status-approved' };
}

// -----------------------------
// Student Status (All View Variant)
// -----------------------------
export function getStudentStatusShort(student) {
  if (!student.teacher_action) {
    return { text: 'Pending Teacher', class: 'status-pending' };
  }
  if (!student.teacher_verified) {
    return { text: 'Rejected by Teacher', class: 'status-rejected' };
  }
  if (!student.admin_action) {
    return { text: 'Pending Admin', class: 'status-pending' };
  }
  if (!student.admin_verified) {
    return { text: 'Rejected by Admin', class: 'status-rejected' };
  }
  return { text: 'Verified', class: 'status-approved' };
}

// -----------------------------
// Teacher Status Resolver
// -----------------------------
export function getTeacherStatus(teacher) {
  const statusClass = teacher.is_verified
    ? 'status-approved'
    : teacher.verification_completed
      ? 'status-rejected'
      : 'status-pending';

  const statusText = teacher.is_verified
    ? 'Verified'
    : teacher.verification_completed
      ? 'Rejected'
      : 'Pending';

  return { statusClass, statusText };
}

// -----------------------------
// Search Filter
// -----------------------------
export function filterData(data, currentType, searchTerm) {
  const term = searchTerm.toLowerCase();

  if (currentType === 'teacher') {
    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.branch?.toLowerCase().includes(term),
    );
  }

  return data.filter(
    (item) =>
      item.name?.toLowerCase().includes(term) ||
      item.email?.toLowerCase().includes(term) ||
      item.rollNo?.toLowerCase().includes(term) ||
      item.teacher?.name?.toLowerCase().includes(term),
  );
}
