import * as ui from './machine.ui.js';
import * as utils from './machine.util.js';
import Swal from 'sweetalert2';

let currentFilter = 'all';
let tableWrapper;
//SERVICES

// ---------------- FETCH MACHINES ----------------
export async function fetchMachines() {
  const resp = await fetch('/dashboard/admin/machines', {
    credentials: 'include',
  });

  if (!resp.ok) {
    throw new Error('Failed to load machines');
  }

  return resp.json();
}

// ---------------- DELETE MACHINE ----------------
export async function deleteMachine(id) {
  const resp = await fetch(`/dashboard/admin/machines/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(txt || resp.statusText);
  }

  return true;
}

// ---------------- UPDATE MACHINE ----------------
// export async function updateMachine(id, data) {
//   const resp = await fetch(`/dashboard/admin/machines/${id}`, {
//     method: 'PUT',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   });

//   if (!resp.ok) {
//     const txt = await resp.text();
//     throw new Error(txt || resp.statusText);
//   }

//   return true;
// }

// ---------------- CREATE MACHINE ----------------
export async function createMachine(data) {
  const resp = await fetch('/dashboard/admin/create-machine', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await resp.json();

  if (!resp.ok) {
    throw new Error(json.error || resp.statusText);
  }

  return json;
}

// ---------------- REVOKE ASSIGNMENT ----------------
export async function updateMachineAvailability(id, data) {
  const resp = await fetch(`/dashboard/admin/machines/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => null);
    throw new Error(txt || resp.statusText);
  }

  return true;
}

//CONTROLLERS

export async function handleDelete(machine, tr) {
  if (utils.getAssignedStatus(machine)) {
    Toastify({
      text: 'Cannot delete machine that is assigned.',
      duration: 3000,
      gravity: 'top',
      position: 'center',
      backgroundColor: '#ff6b6b',
    }).showToast();
    return;
  }

  if (!(await utils.machineConfirmDelete(machine))) return;

  try {
    if (machine._id) {
      await deleteMachine(machine._id);
    }

    tr.remove();

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Machine deleted successfully',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  } catch (err) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'Delete failed: ' + err.message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }
}

/**
 * Handle revoking machine assignment
 */
async function handleRevoke(machine, revokeBtn) {
  const idText = machine.MIGID ? ` (${machine.MIGID})` : '';

  const result = await Swal.fire({
    title: 'Mark Machine Unavailable',
    html: `Type <strong>CONFIRM</strong> to mark this machine${idText} as unavailable for future allotments`,
    input: 'text',
    showCancelButton: true,
    confirmButtonText: 'Revoke',
    inputValidator: (value) => {
      if (!value || value.trim().toUpperCase() !== 'CONFIRM') {
        return 'Please type CONFIRM';
      }
    },
  });

  if (!result.isConfirmed) return;

  revokeBtn.disabled = true;
  const originalText = revokeBtn.textContent;
  revokeBtn.textContent = 'Processing...';

  try {
    await updateMachineAvailability(machine._id, { isAvailable: false });

    revokeBtn.remove();

    await loadMachines();

    Swal.fire('Machine marked as unavailable.', '', 'success');
  } catch (err) {
    revokeBtn.disabled = false;
    revokeBtn.textContent = originalText;

    Toastify({
      text: err.message,
      duration: 3000,
      gravity: 'top',
      position: 'center',
      backgroundColor: '#ff6b6b',
    }).showToast();
  }
}

/**
 * Handle editing a machine (open edit modal)
 */
// export function handleEdit(machine, tr, handleEditSubmit) {
//   if (utils.getAssignedStatus(machine)) {
//     Toastify({
//       text: "Cannot edit assigned machine",
//       duration: 3000, gravity: "top", position: "center",
//       backgroundColor: "#ff6b6b"
//     }).showToast();
//     return;
//   }

//   const modal = ui.ensureEditModal(handleEditSubmit);
//   ui.openEditModal(modal, machine, tr);
// }

/**
 * Handle edit form submission
 */
// export async function handleEditSubmit({ id, MIGID, gpuRaw }, loadMachines) {
//   const { valid, value: gpu } = utils.validateGpu(gpuRaw);

//   if (!valid) {
//     Toastify({ text: 'GPU RAM must be non-negative', duration: 3000 }).showToast();
//     return;
//   }

//   try {
//     if (id) {
//       await updateMachine(id, { MIGID: MIGID || null, gpuRam: gpu });
//     }

//     ui.closeEditModal();

//     Swal.fire({
//       toast: true,
//       position: 'top-end',
//       icon: 'success',
//       title: 'Machine updated successfully',
//       showConfirmButton: false,
//       timer: 3000
//     });

//     loadMachines();

//   } catch (err) {
//     Toastify({ text: err.message }).showToast();
//   }
// }

/**
 * Handle add form submission
 */
async function handleAddSubmit({ MIGID, gpuRaw, ramRaw, ip, portRaw, user, name }) {
  const { valid, errors, values } = utils.validateMachineAddFields({
    MIGID,
    gpuRaw,
    ramRaw,
    ip,
    portRaw,
    user,
    name,
  });
  if (!valid) {
    // Show first error found
    const firstError = Object.values(errors)[0];
    return Swal.fire({ toast: true, icon: 'error', title: firstError });
  }

  try {
    await createMachine({
      MIGID: values.MIGID,
      gpuRam: values.gpuRam,
      ram: values.ram,
      ip: values.ip,
      port: values.port,
      user: values.user,
      name: values.name,
    });

    ui.closeAddModal();

    Swal.fire({
      toast: true,
      icon: 'success',
      title: 'Machine created successfully',
    });

    loadMachines();
  } catch (err) {
    Swal.fire({
      toast: true,
      icon: 'error',
      title: err.message,
    });
  }
}

async function handleEnable(machine, enableBtn) {
  const idText = machine.MIGID ? ` (${machine.MIGID})` : '';

  const result = await Swal.fire({
    title: 'Mark Machine Available',
    html: `Type <strong>CONFIRM</strong> to mark this machine${idText} as available for future allotments`,
    input: 'text',
    showCancelButton: true,
    confirmButtonText: 'Enable',
    inputValidator: (value) => {
      if (!value || value.trim().toUpperCase() !== 'CONFIRM') {
        return 'Please type CONFIRM';
      }
    },
  });

  if (!result.isConfirmed) return;

  enableBtn.disabled = true;
  const originalText = enableBtn.textContent;
  enableBtn.textContent = 'Processing...';

  try {
    await updateMachineAvailability(machine._id, { isAvailable: true });

    enableBtn.remove();

    await loadMachines();

    Swal.fire('Machine marked as available.', '', 'success');
  } catch (err) {
    enableBtn.disabled = false;
    enableBtn.textContent = originalText;

    Toastify({
      text: err.message,
      duration: 3000,
      gravity: 'top',
      position: 'center',
      backgroundColor: '#ff6b6b',
    }).showToast();
  }
}

// ---------------- LOAD MACHINES ----------------
async function loadMachines(filter = currentFilter) {
  try {
    const json = await fetchMachines();
    const machines = json.machines || [];
    const filtered = utils.filterMachines(machines, filter);

    ui.renderTable(tableWrapper, filtered, {
      isAssigned: utils.getAssignedStatus,
      setAssignedText: (val, td) => {
        const text = utils.formatAssignedStudent(val);

        if (text.includes('\n')) {
          const [line1, line2] = text.split('\n');
          td.textContent = '';
          td.appendChild(document.createTextNode(line1));
          td.appendChild(document.createElement('br'));
          td.appendChild(document.createTextNode(line2));
        } else {
          td.textContent = text;
        }
      },
      // onEdit: (machine, tr) => handleEdit(machine, tr, (data) => handleEditSubmit(data, loadMachines)),
      onDelete: handleDelete,
      onRevoke: handleRevoke,
      onEnable: handleEnable,
    });
  } catch (err) {
    console.error('Failed to load machines', err);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  tableWrapper = ui.createTableWrapper();

  const uiRefs = ui.initUI({
    onFilterChange: (f) => {
      currentFilter = f;
      loadMachines(f);
    },
    onAddClick: () => {
      const modal = ui.ensureAddModal((data) => handleAddSubmit(data, loadMachines));
      ui.openAddModal(modal);
    },
  });
  loadMachines();
});
