// utils.js

// ---------------- FILE VALIDATION ----------------
export function isCSVFile(file) {
  return file && file.name.toLowerCase().endsWith('.csv');
}


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


// ---------------- VALIDATION ----------------
export function validateGpu(gpuRaw) {
  const gpu = gpuRaw === '' ? null : Number(gpuRaw);

  if (gpu !== null && (Number.isNaN(gpu) || gpu < 0)) {
    return { valid: false, value: gpu };
  }

  return { valid: true, value: gpu };
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