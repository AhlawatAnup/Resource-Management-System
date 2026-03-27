// utils.js

// ---------------- MACHINE STATE HELPERS ----------------
export function getAssignedStatus(machine) {
  let isAssigned = (typeof machine.isAssigned === 'boolean') ? machine.isAssigned : null;

  if (isAssigned === null) {
    isAssigned = !!(machine.assignedStudent);
  }

  return isAssigned;
}


// ---------------- FILTERING ----------------
export function filterMachines(machines, currentFilter) {
  if (!machines || !machines.length) return [];

  return machines.filter(m => {
    const isAssigned = getAssignedStatus(m);

    if (currentFilter === 'all') return true;
    if (currentFilter === 'free') return !isAssigned;
    if (currentFilter === 'assigned') return !!isAssigned;

    return true;
  });
}


// ---------------- FORMATTERS ----------------
export function formatAssignedStudent(val) {
  if (!val) return 'Unassigned';

  const isPlainObj = val && typeof val === 'object' && !Array.isArray(val);

  if (isPlainObj) {
    const roll = val.rollNumber || null;
    const name = val.name || null;

    if (roll && name) return `${roll}\n${name}`;
    if (roll) return roll;
    if (name) return name;
    if (val.studentId) return val.studentId;

    return JSON.stringify(val);
  }

  return String(val);
}

export function validateMachineAddFields({
  MIGID,
  gpuRaw,
  ramRaw,
  ip,
  portRaw,
  user,
  name,
  token
}) {
  const errors = {};

  // --- Trim strings ---
  MIGID = MIGID?.trim();
  ip = ip?.trim();
  user = user?.trim();
  name = name?.trim();
  token = token?.trim();

  // --- Required string fields ---
  if (!MIGID) errors.MIGID = 'MIGID is required';
  if (!ip) errors.ip = 'IP is required';
  if (!user) errors.user = 'User is required';
  if (!name) errors.name = 'Name is required';
  if (!token) errors.token = 'Token is required';

  // --- GPU (optional, but must be valid number if provided) ---
  let gpu = null;
  if (gpuRaw !== '' && gpuRaw !== null && gpuRaw !== undefined) {
    gpu = Number(gpuRaw);
    if (Number.isNaN(gpu) || gpu < 0) {
      errors.gpuRaw = 'GPU RAM must be a non-negative number';
    }
  }

  // --- RAM (required, must be number > 0) ---
  let ram;
  if (ramRaw === '' || ramRaw === null || ramRaw === undefined) {
    errors.ramRaw = 'RAM is required';
  } else {
    ram = Number(ramRaw);
    if (Number.isNaN(ram) || ram <= 0) {
      errors.ramRaw = 'RAM must be a positive number';
    }
  }

  // --- PORT (required, must be number > 0) ---
  let port;
  if (portRaw === '' || portRaw === null || portRaw === undefined) {
    errors.portRaw = 'Port is required';
  } else {
    port = Number(portRaw);
    if (Number.isNaN(port) || port <= 0) {
      errors.portRaw = 'Port must be a valid number';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      MIGID,
      gpuRam: gpu,
      ram,
      ip,
      port,
      user,
      name,
      token
    }
  };
}

// ---------------- VALIDATION ----------------
export function validateGpu(gpuRaw) {
  const gpu = gpuRaw === '' ? null : Number(gpuRaw);

  if (gpu !== null && (Number.isNaN(gpu) || gpu < 0)) {
    return { valid: false, value: gpu };
  }

  return { valid: true, value: gpu };
}

export function validateRam(ramRaw) {
  const ram = Number(ramRaw);

  if (ramRaw === '' || ramRaw === null || ramRaw === undefined) {
    return { valid: false, value: ram };
  }

  if (Number.isNaN(ram) || ram <= 0) {
    return { valid: false, value: ram };
  }

  return { valid: true, value: ram };
}


// ---------------- CONFIRMATION HELPERS ----------------
export async function machineConfirmDelete(machine) {
  const idText = machine.MIGID ? ` (${machine.MIGID})` : '';

  const result = await Swal.fire({
    title: 'Delete Machine',
    text: `Are you sure you want to delete this machine${idText}? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#fa6251ff'
  });

  return result.isConfirmed;
}