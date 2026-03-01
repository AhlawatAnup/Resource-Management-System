// Get verification status text for teacher
export function getVerificationStatus(teacher) {
  if (teacher.is_verified) {
    return '✓ Verified';
  } else if (teacher.verification_completed && !teacher.is_verified) {
    return '✗ Rejected';
  } else {
    return '⏳ Pending Verification';
  }
}

// Get CSS class for teacher status
export function getStatusClass(teacher) {
  if (teacher.is_verified) {
    return 'verified';
  } else if (teacher.verification_completed && !teacher.is_verified) {
    return 'rejected';
  } else {
    return 'pending';
  }
}

// (kept as-is, even if deprecated — no logic change rule)
export function getStatusColor(isVerified) {
  return isVerified ? '#28a745' : '#ffc107';
}

// Student verification status (teacher perspective)
export function getStudentVerificationStatusForTeacher(student) {
  if (student.teacher_verified && student.admin_verified) {
    return "Verified";
  }

  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return "Pending on Admin";
    } else {
      return "Declined by Teacher";
    }
  }

  if (!student.teacher_action) {
    return "Pending on Teacher";
  }

  if (student.admin_action) {
    if (student.admin_verified) {
      return "Verified";
    } else {
      return "Declined by Admin";
    }
  }

  return "Pending";
}

// Student status CSS class
export function getStudentStatusClassForTeacher(student) {
  if (student.teacher_verified && student.admin_verified) {
    return "verified";
  }

  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return "pending-admin";
    } else {
      return "declined";
    }
  }

  if (!student.teacher_action) {
    return "pending-teacher";
  }

  if (student.admin_action) {
    if (student.admin_verified) {
      return "verified";
    } else {
      return "declined";
    }
  }

  return "pending";
}