// admin-machines.handlers.js
import * as ui from './admin-machines.ui.js';
import * as service from './admin-machines.service.js';
import * as utils from './admin-machines.utils.js';

/**
 * Handle deleting a machine
 */
export async function handleDelete(machine, tr) {
  if (utils.getAssignedStatus(machine)) {
    Toastify({ 
      text: "Cannot delete machine that is assigned.", 
      duration: 3000, gravity: "top", position: "center", 
      backgroundColor: "#ff6b6b" 
    }).showToast();
    return;
  }

  if (!await utils.machineConfirmDelete(machine)) return;

  try {
    if (machine._id) {
      await service.deleteMachine(machine._id);
    }

    tr.remove();

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Machine deleted successfully',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

  } catch (err) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'Delete failed: ' + err.message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
}

/**
 * Handle revoking machine assignment
 */
export async function handleRevoke(machine, revokeBtn, loadMachines) {
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
    }
  });

  if (!result.isConfirmed) return;

  revokeBtn.disabled = true;
  const originalText = revokeBtn.textContent;
  revokeBtn.textContent = 'Processing...';

  try {
    await service.updateMachineAvailability(machine._id, { isAvailable: false });

    revokeBtn.remove();

    await loadMachines();

    Swal.fire('Machine marked as unavailable.', '', 'success');

  } catch (err) {
    revokeBtn.disabled = false;
    revokeBtn.textContent = originalText;

    Toastify({ 
      text: err.message, 
      duration: 3000, gravity: "top", position: "center", 
      backgroundColor: "#ff6b6b" 
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
//       await service.updateMachine(id, { MIGID: MIGID || null, gpuRam: gpu });
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
export async function handleAddSubmit(
  { MIGID, gpuRaw, ramRaw, ip, portRaw, user, name, token },
  loadMachines
) {
  const { valid, errors, values } = utils.validateMachineAddFields({ MIGID, gpuRaw, ramRaw, ip, portRaw, user, name, token });
  if (!valid) {
    // Show first error found
    const firstError = Object.values(errors)[0];
    return Swal.fire({ toast: true, icon: 'error', title: firstError });
  }

  try {
    await service.createMachine({
      MIGID: values.MIGID,
      gpuRam: values.gpuRam,
      ram: values.ram,
      ip: values.ip,
      port: values.port,
      user: values.user,
      name: values.name,
      token: values.token
    });

    ui.closeAddModal();

    Swal.fire({
      toast: true,
      icon: 'success',
      title: 'Machine created successfully'
    });

    loadMachines();

  } catch (err) {
    Swal.fire({
      toast: true,
      icon: 'error',
      title: err.message
    });
  }
}

export async function handleEnable(machine, enableBtn, loadMachines) {
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
    }
  });

  if (!result.isConfirmed) return;

  enableBtn.disabled = true;
  const originalText = enableBtn.textContent;
  enableBtn.textContent = 'Processing...';

  try {
    await service.updateMachineAvailability(machine._id, { isAvailable: true });

    enableBtn.remove();

    await loadMachines();

    Swal.fire('Machine marked as available.', '', 'success');

  } catch (err) {
    enableBtn.disabled = false;
    enableBtn.textContent = originalText;

    Toastify({ 
      text: err.message, 
      duration: 3000, gravity: "top", position: "center", 
      backgroundColor: "#ff6b6b" 
    }).showToast();
  }
}