document.addEventListener('DOMContentLoaded', () => {
  const importBtn = document.getElementById('importCsvBtn');
  const importInput = document.getElementById('importCsvInput');
  // cache and filter state
  let machinesCache = [];
  let currentFilter = 'all'; // all | free | assigned

  // create table container and place it below the page actions so the import button remains top-right
  const tableWrapper = document.createElement('div');
  tableWrapper.id = 'machinesTableWrapper';
  tableWrapper.style.margin = '16px 24px';
  const pageActions = document.querySelector('.page-actions');
  if (pageActions && pageActions.parentNode) {
    pageActions.insertAdjacentElement('afterend', tableWrapper);
  } else {
    // fallback: append to main wrapper
    const main = document.querySelector('.main-wrapper') || document.body;
    main.appendChild(tableWrapper);
  }

  importBtn.addEventListener('click', () => importInput.click());

  // wire filter buttons (UI-only filtering)
  const filterButtons = document.querySelectorAll('.machines-filters .status-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // update active class
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter || 'all';
      currentFilter = f;
      applyFilterAndRender();
    });
  });

  importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic client-side check
    if (!file.name.toLowerCase().endsWith('.csv')) {
      Toastify({text: "Please select a CSV file", duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      importBtn.disabled = true;
      importBtn.textContent = 'Uploading...';

      const resp = await fetch('/dashboard/admin/upload-machines', {
        method: 'POST',
        body: formData,
        credentials: 'include' // send cookies for session auth
      });

      const json = await resp.json();
      if (!resp.ok) {
        Toastify({text: 'Import failed: ' + (json.error || resp.statusText), duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
      } else {
        const msg = `Imported: ${json.imported} / ${json.total}`;
        if (json.skipped && json.skipped.length) {
          Swal.fire({
            icon: 'success',
            title: 'Import completed',
            text: `${msg}. Skipped rows: ${json.skipped.length}`
          });
          // console.log('Skipped rows:', json.skipped);
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Import successful',
            text: msg
          });
        }
      }
    } catch (err) {
      console.error(err);
      Toastify({text: 'Upload error: ' + err.message, duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
    } finally {
      importBtn.disabled = false;
      importBtn.textContent = 'Import CSV';
      importInput.value = '';
      // refresh list after import
      loadMachines();
    }
  });

  const addBtn = document.getElementById('addMachineBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const modal = ensureAddModal();
      openAddModal(modal);
    });
  }

  // load machines and render simple table
  async function loadMachines() {
    try {
      const resp = await fetch('/dashboard/admin/machines', { credentials: 'include' });
      if (!resp.ok) return;
      const json = await resp.json();
      machinesCache = json.machines || [];
      applyFilterAndRender();
    } catch (err) { console.error('Failed to load machines', err); }
  }

  // expose for other helpers to refresh after create
  window.reloadMachines = loadMachines;

  function applyFilterAndRender() {
    if (!machinesCache || !machinesCache.length) {
      renderTable([]);
      return;
    }
    const filtered = machinesCache.filter(m => {
      // isAssigned is a boolean per schema. If missing, fallback to assignedStudent presence.
      let isAssigned = (typeof m.isAssigned === 'boolean') ? m.isAssigned : null;
      if (isAssigned === null) {
        isAssigned = !!(m.assignedStudent);
      }

      if (currentFilter === 'all') return true;
      if (currentFilter === 'free') return !isAssigned;
      if (currentFilter === 'assigned') return !!isAssigned;
      return true;
    });
    renderTable(filtered);
  }

  function renderTable(machines) {
    const wrapper = document.getElementById('machinesTableWrapper');
    wrapper.innerHTML = '';
    if (!machines.length) {
      wrapper.textContent = 'No machines found.';
      return;
    }
    const container = document.createElement('div');
    container.className = 'table-container';
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    // add new columns: Assigned student, Edit
    ['MIGID', 'gpuRam', 'Assigned student', 'Edit'].forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    machines.forEach((m, idx) => {
      const tr = document.createElement('tr');
      // give each row an id so edit modal can reference it later
      const rowId = `machine-row-${m._id || idx}`;
      tr.setAttribute('data-machine-row-id', rowId);
      [m.MIGID, m.gpuRam].forEach(val => {
        const td = document.createElement('td');
        td.textContent = val === undefined ? '' : val;
        tr.appendChild(td);
      });

  // determine assigned state for this row
  let _isAssigned = (typeof m.isAssigned === 'boolean') ? m.isAssigned : null;
  if (_isAssigned === null) _isAssigned = !!(m.assignedStudent);

  // Assigned student cell: show roll number and name when available, otherwise studentId or 'Unassigned'
      const assignedTd = document.createElement('td');
      (function setAssignedText(val, td) {
        if (!val) { td.textContent = 'Unassigned'; return; }
        // treat only non-null plain objects (not arrays) as student objects
        const isPlainObj = val && typeof val === 'object' && !Array.isArray(val);
        if (isPlainObj) {
          // server normalizes to { studentId, rollNumber, name }
          const roll = val.rollNumber || null;
          const name = val.name || null;

          if (roll && name) {
            td.textContent = ''; // clear existing content
            td.appendChild(document.createTextNode(roll));
            td.appendChild(document.createElement('br'));
            td.appendChild(document.createTextNode(name));
            return;
          }
          if (roll) { td.textContent = roll; return; }
          if (name) { td.textContent = name; return; }
          if (val.studentId) { td.textContent = val.studentId; return; }
          td.textContent = JSON.stringify(val);
          return;
        }

        td.textContent = String(val);
      })(m.assignedStudent, assignedTd);
      tr.appendChild(assignedTd);

    // Actions cell: Edit (opens modal), Delete and Revoke (if assigned)
      const actionTd = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn-edit';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        // Prevent editing if machine is assigned
        if (_isAssigned) {
          Toastify({text: "Cannot edit machine that is assigned to a student. Revoke assignment first.", duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
          return;
        }
        openEditModal(m, tr, assignedTd);
      });
      actionTd.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-delete';
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.marginLeft = '8px';
      deleteBtn.addEventListener('click', async () => {
        // Prevent deletion if machine is assigned
        if (_isAssigned) {
          Toastify({text: "Cannot delete machine that is assigned to a student. Revoke assignment first.", duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
          return;
        }
        
        if (!await machineConfirmDelete(m)) return;
        try {
          if (m._id) {
            const resp = await fetch(`/dashboard/admin/machines/${m._id}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            if (!resp.ok) {
              const txt = await resp.text();
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Delete failed: ' + (txt || resp.statusText),
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
              });
              return;
            }
          }
          // remove row from DOM
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
          console.error('Failed to delete machine', err);
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Failed to delete machine.',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
        }
      });
      actionTd.appendChild(deleteBtn);

      // Revoke assignment button: only show when machine is assigned
      if (_isAssigned) {
        const revokeBtn = document.createElement('button');
        revokeBtn.type = 'button';
        revokeBtn.className = 'btn btn-revoke';
        revokeBtn.textContent = 'Revoke';
        revokeBtn.style.marginLeft = '8px';
        // style as red button
        revokeBtn.style.background = '#fa6251ff';
        revokeBtn.style.color = '#fff';
        revokeBtn.addEventListener('click', async () => {
          const idText = m.MIGID ? ` (${m.MIGID})` : '';
          const result = await Swal.fire({
            title: 'Revoke Assignment',
            html: `Type <strong>CONFIRM</strong> to revoke assignment for this machine${idText}, or cancel to abort.<br><br><em>The resource request will also be deleted. This process is irreversible.</em>`,
            input: 'text',
            inputPlaceholder: 'Type CONFIRM',
            showCancelButton: true,
            confirmButtonText: 'Revoke',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
              if (!value) return 'Please enter a value';
              if (value.trim().toUpperCase() !== 'CONFIRM') return 'Please type CONFIRM';
            }
          });
          if (!result.isConfirmed) return;

          // Show processing state
          revokeBtn.disabled = true;
          const originalText = revokeBtn.textContent;
          revokeBtn.textContent = 'Processing...';
          revokeBtn.style.opacity = '0.6';
          revokeBtn.style.cursor = 'not-allowed';

          try {
            // Revoke assignment
            if (m._id) {
              const resp = await fetch(`/dashboard/admin/machines/${m._id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedStudent: null })
              });
              if (!resp.ok) {
                const txt = await resp.text().catch(() => null);
                // Reset button state on error
                revokeBtn.disabled = false;
                revokeBtn.textContent = originalText;
                revokeBtn.style.opacity = '1';
                revokeBtn.style.cursor = 'pointer';
                Toastify({text: 'Revoke failed: ' + (txt || resp.statusText), duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
                return;
              }
            }

            assignedTd.textContent = 'Unassigned';
            revokeBtn.remove();
            if (window.reloadMachines) {
              try { await window.reloadMachines(); } catch (e) { /* ignore reload errors */ }
            }
            Swal.fire('Assignment revoked successfully.', '', 'success');

          } catch (err) {
            console.error('Failed to revoke assignment', err);
            // Reset button state on error
            revokeBtn.disabled = false;
            revokeBtn.textContent = originalText;
            revokeBtn.style.opacity = '1';
            revokeBtn.style.cursor = 'pointer';
            Toastify({text: 'Failed to revoke assignment. See console for details.', duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
          }
        });
        actionTd.appendChild(revokeBtn);
      }
      tr.appendChild(actionTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
    wrapper.appendChild(container);
  }

  loadMachines();
});


// Confirm delete helper
async function machineConfirmDelete(machine) {
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

// Create modal (singleton) and helpers
function ensureEditModal() {
  if (document.getElementById('machineEditModal')) return document.getElementById('machineEditModal');
  const modal = document.createElement('div');
  modal.id = 'machineEditModal';
  modal.style.position = 'fixed';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.background = 'rgba(0,0,0,0.4)';
  modal.style.display = 'none';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.innerHTML = `
    <div style="background:#fff;padding:18px;border-radius:8px;max-width:480px;width:100%;box-shadow:0 6px 24px rgba(0,0,0,0.2);">
      <h3 id="machineEditTitle">Edit Machine</h3>
      <form id="machineEditForm">
        <div style="margin-bottom:8px;"><label>MIGID<br><input name="MIGID" id="machineMIGID" style="width:100%;padding:8px;"/></label></div>
        <div style="margin-bottom:8px;"><label>GPU RAM (GB)<br><input name="gpuRam" id="machineGpu" style="width:100%;padding:8px;"/></label></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" id="machineEditCancel" style="padding:8px 12px;">Cancel</button>
          <button type="submit" id="machineEditSave" style="padding:8px 12px;">Save</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const form = modal.querySelector('#machineEditForm');
  const cancel = modal.querySelector('#machineEditCancel');
  cancel.addEventListener('click', () => closeEditModal());
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = modal.querySelector('#machineEditSave');
    saveBtn.disabled = true;
    saveBtn.style.opacity = '0.5';

    const id = modal.dataset.machineId;
    const rowSelector = modal.dataset.rowSelector;

    const MIGID = modal.querySelector('#machineMIGID').value.trim();

    const gpuRaw = modal.querySelector('#machineGpu').value.trim();
    const gpu = gpuRaw === '' ? null : Number(gpuRaw);

    if (gpu !== null && (Number.isNaN(gpu) || gpu < 0)) {
      Toastify({text: 'GPU RAM must be a non-negative number', duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();

      saveBtn.disabled = false;
      saveBtn.style.opacity = '1';
      return;
    }

    try {
      // call server to update (if id present)
      if (id) {
        const resp = await fetch(`/dashboard/admin/machines/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ MIGID: MIGID || null, gpuRam: gpu })
        });
        if (!resp.ok) {
          const txt = await resp.text();
          Toastify({text: 'Update failed: ' + (txt || resp.statusText), duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
          return;
        }
      }

      // update UI row
      if (rowSelector) {
        const tr = document.querySelector(rowSelector);
        if (tr) {
          const tds = tr.querySelectorAll('td');
          if (tds[0]) tds[0].textContent = MIGID || '';
          if (tds[1]) tds[1].textContent = gpu !== null ? String(gpu) : '';
        }
      }

      closeEditModal();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Machine updated successfully',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Failed to update machine', err);
      Toastify({text: 'Failed to update machine', duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
    } finally {
      // Re-enable save button for next use
      saveBtn.disabled = false;
      saveBtn.style.opacity = '1';
    }
  });

  return modal;
}

// --- Add Machine modal ---
function ensureAddModal() {
  if (document.getElementById('machineAddModal')) return document.getElementById('machineAddModal');
  const modal = document.createElement('div');
  modal.id = 'machineAddModal';
  modal.style.position = 'fixed';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.background = 'rgba(0,0,0,0.4)';
  modal.style.display = 'none';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.innerHTML = `
    <div style="background:#fff;padding:18px;border-radius:8px;max-width:520px;width:100%;box-shadow:0 6px 24px rgba(0,0,0,0.2);">
      <h3 id="machineAddTitle">Add Machine</h3>
      <form id="machineAddForm">
        <div style="margin-bottom:8px;"><label>MIGID<br><input name="MIGID" id="addMIGID" style="width:100%;padding:8px;"/></label></div>
        <div style="margin-bottom:8px;"><label>GPU RAM<br><input name="gpuRam" id="addGpuRam" style="width:100%;padding:8px;"/></label></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" id="machineAddCancel" style="padding:8px 12px;">Cancel</button>
          <button type="submit" id="machineAddSave" style="padding:8px 12px;">Save</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // handlers: cancel closes modal, submit just closes (UI-only)
  const cancel = modal.querySelector('#machineAddCancel');
  cancel.addEventListener('click', () => closeAddModal());
  const form = modal.querySelector('#machineAddForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const MIGID = modal.querySelector('#addMIGID').value.trim();
    const gpuRaw = modal.querySelector('#addGpuRam').value.trim();
    const gpu = gpuRaw === '' ? null : Number(gpuRaw);
    if (!MIGID) { 
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'MIGID is required',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }
    if (gpu === null || Number.isNaN(gpu) || gpu < 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'GPU RAM isnt valid',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    try {
      const resp = await fetch('/dashboard/admin/create-machine', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MIGID, gpuRam: gpu })
      });
      const json = await resp.json();
      if (!resp.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Create failed: ' + (json.error || resp.statusText),
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        return;
      }
      // success: close and reload list
      closeAddModal();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Machine created successfully',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      if (window.reloadMachines) window.reloadMachines(); else location.reload();
    } catch (err) {
      console.error('Failed to create machine', err);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Failed to create machine. See console for details.',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  });

  // clicking outside content closes modal
  modal.addEventListener('click', (e) => { if (e.target === modal) closeAddModal(); });
  // escape key
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAddModal(); });

  return modal;
}

function openAddModal(modal) {
  if (!modal) modal = ensureAddModal();
  modal.style.display = 'flex';
  const first = modal.querySelector('input');
  if (first) first.focus();
}

function closeAddModal() {
  const modal = document.getElementById('machineAddModal');
  if (!modal) return;
  modal.style.display = 'none';
  // clear fields for next open
  const form = modal.querySelector('#machineAddForm');
  if (form) form.reset();
}

function openEditModal(machine, tableRow, assignedCell) {
  const modal = ensureEditModal();
  modal.style.display = 'flex';
  modal.dataset.machineId = machine._id || '';
  // store a selector so we can find the row later
  const rowId = `machine-row-${machine._id || Math.random().toString(36).slice(2, 9)}`;
  tableRow.setAttribute('data-machine-row-id', rowId);
  modal.dataset.rowSelector = `[data-machine-row-id="${rowId}"]`;
  modal.querySelector('#machineMIGID').value = machine.MIGID || '';
  modal.querySelector('#machineGpu').value = machine.gpuRam !== undefined && machine.gpuRam !== null ? String(machine.gpuRam) : '';
  const assignedInput = modal.querySelector('#machineAssigned');
  if (assignedInput) assignedInput.value = (machine.assignedStudent && (machine.assignedStudent.studentId || machine.assignedStudent)) || '';
}

function closeEditModal() {
  const modal = document.getElementById('machineEditModal');
  if (!modal) return;
  modal.style.display = 'none';
  delete modal.dataset.machineId;
  delete modal.dataset.rowSelector;
  // Reset form for next use
  const form = modal.querySelector('#machineEditForm');
  if (form) form.reset();
}
