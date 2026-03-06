// utils.js

// -----------------------------
// Endpoint Resolver
// -----------------------------
export function getEndpoint(currentType, currentStatus) {
  if (currentType === 'teacher') {
    if (currentStatus === 'unverified') return '/dashboard/admin/teachers/pending';
    if (currentStatus === 'verified') return '/dashboard/admin/teachers';
    if (currentStatus === 'rejected') return '/dashboard/admin/teachers/rejected';
    if (currentStatus === 'all') return '/dashboard/admin/teachers';
  } else {
    if (currentStatus === 'unverified') return '/dashboard/admin/students/pending';
    if (currentStatus === 'verified') return '/dashboard/admin/students';
    if (currentStatus === 'rejected') return '/dashboard/admin/students/rejected';
    if (currentStatus === 'all') return '/dashboard/admin/students';
  }

  return '';
}

// -----------------------------
// Data Extraction Logic
// -----------------------------
export function extractDataByTypeAndStatus(data, currentType, currentStatus) {
  if (currentType === 'teacher') {
    if (currentStatus === 'unverified') {
      return data.teachers || [];
    }
    if (currentStatus === 'verified') {
      return (data.teachers || []).filter(t => t.is_verified);
    }
    if (currentStatus === 'rejected') {
      return data.teachers || [];
    }
    if (currentStatus === 'all') {
      return data.teachers || [];
    }
  } else {
    if (currentStatus === 'unverified') {
      return data.students || [];
    }
    if (currentStatus === 'verified') {
      return (data.students || []).filter(s => s.is_verified);
    }
    if (currentStatus === 'rejected') {
      return data.students || [];
    }
    if (currentStatus === 'all') {
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
      'Actions'
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
    countLabel: statusText
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
    return { text: 'Pending on Teacher', class: 'pending' };
  }
  if (!student.teacher_verified) {
    return { text: 'Rejected by Teacher', class: 'rejected' };
  }
  if (!student.admin_action) {
    return { text: 'Pending on Admin', class: 'pending' };
  }
  if (!student.admin_verified) {
    return { text: 'Rejected by Admin', class: 'rejected' };
  }
  return { text: 'Verified', class: 'verified' };
}

// -----------------------------
// Student Status (All View Variant)
// -----------------------------
export function getStudentStatusShort(student) {
  if (!student.teacher_action) {
    return { text: 'Pending Teacher', class: 'pending' };
  }
  if (!student.teacher_verified) {
    return { text: 'Rejected by Teacher', class: 'rejected' };
  }
  if (!student.admin_action) {
    return { text: 'Pending Admin', class: 'pending' };
  }
  if (!student.admin_verified) {
    return { text: 'Rejected by Admin', class: 'rejected' };
  }
  return { text: 'Verified', class: 'verified' };
}

// -----------------------------
// Teacher Status Resolver
// -----------------------------
export function getTeacherStatus(teacher) {
  const statusClass = teacher.is_verified
    ? 'verified'
    : (teacher.verification_completed ? 'rejected' : 'pending');

  const statusText = teacher.is_verified
    ? 'Verified'
    : (teacher.verification_completed ? 'Rejected' : 'Pending');

  return { statusClass, statusText };
}

// -----------------------------
// Search Filter
// -----------------------------
export function filterData(data, currentType, searchTerm) {
  const term = searchTerm.toLowerCase();

  if (currentType === 'teacher') {
    return data.filter(item =>
      item.name?.toLowerCase().includes(term) ||
      item.email?.toLowerCase().includes(term) ||
      item.branch?.toLowerCase().includes(term)
    );
  }

  return data.filter(item =>
    item.name?.toLowerCase().includes(term) ||
    item.email?.toLowerCase().includes(term) ||
    item.rollNo?.toLowerCase().includes(term) ||
    item.teacher?.name?.toLowerCase().includes(term)
  );
}