// ui.js

// ---------------- INIT UI ----------------
export function initUI({ onImportClick, onFileChange, onFilterChange, onAddClick }) {
  const importBtn = document.getElementById('importCsvBtn');
  const importInput = document.getElementById('importCsvInput');
  const addBtn = document.getElementById('addMachineBtn');

  importBtn.addEventListener('click', onImportClick);
  importInput.addEventListener('change', onFileChange);

  if (addBtn) addBtn.addEventListener('click', onAddClick);

  const filterButtons = document.querySelectorAll('.machines-filters .status-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onFilterChange(btn.dataset.filter || 'all');
    });
  });

  return { importBtn, importInput };
}


// ---------------- TABLE WRAPPER ----------------
export function createTableWrapper() {
  const tableWrapper = document.createElement('div');
  tableWrapper.id = 'machinesTableWrapper';
  tableWrapper.style.margin = '16px 24px';

  const pageActions = document.querySelector('.page-actions');

  if (pageActions && pageActions.parentNode) {
    pageActions.insertAdjacentElement('afterend', tableWrapper);
  } else {
    const main = document.querySelector('.main-wrapper') || document.body;
    main.appendChild(tableWrapper);
  }

  return tableWrapper;
}


// ---------------- TABLE RENDER ----------------
export function renderTable(wrapper, machines, handlers) {
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
  ['MIGID', 'gpuRam', 'ram', 'ip:port', 'name', 'Action'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  machines.forEach((m, idx) => {
    const tr = document.createElement('tr');
    const rowId = `machine-row-${m._id || idx}`;
    tr.setAttribute('data-machine-row-id', rowId);

    // Render the required columns in order, combining ip and port

    const rowVals = [
      m.MIGID,
      m.gpuRam,
      m.ram,
      (m.ip && m.port ? `${m.ip}:${m.port}` : (m.ip || '')),
      m.name
    ];
    rowVals.forEach(val => {
      const td = document.createElement('td');
      td.textContent = val === undefined ? '' : val;
      tr.appendChild(td);
    });

    // Action buttons cell
    const actionTd = document.createElement('td');
    // Delete button
    const deleteBtn = createBtn('Delete', () => handlers.onDelete(m, tr));
    actionTd.appendChild(deleteBtn);
    // Revoke button
    const revokeBtn = createBtn('Revoke', () => handlers.onRevoke(m, tr));
    revokeBtn.style.marginLeft = '8px';
    revokeBtn.style.background = '#fa6251ff';
    revokeBtn.style.color = '#fff';
    actionTd.appendChild(revokeBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
  wrapper.appendChild(container);
}


// ---------------- BUTTON HELPER ----------------
function createBtn(text, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.textContent = text;
  btn.addEventListener('click', onClick);
  return btn;
}


// ---------------- EDIT MODAL ----------------
// export function ensureEditModal(onSubmit) {
//   if (document.getElementById('machineEditModal'))
//     return document.getElementById('machineEditModal');

//   const modal = document.createElement('div');
//   modal.id = 'machineEditModal';

//   Object.assign(modal.style, {
//     position: 'fixed',
//     left: '0',
//     top: '0',
//     right: '0',
//     bottom: '0',
//     background: 'rgba(0,0,0,0.4)',
//     display: 'none',
//     alignItems: 'center',
//     justifyContent: 'center'
//   });

//   modal.innerHTML = `
//     <div style="background:#fff;padding:18px;border-radius:8px;max-width:480px;width:100%;">
//       <h3>Edit Machine</h3>
//       <form id="machineEditForm">
//         <input id="machineMIGID"/>
//         <input id="machineGpu"/>
//         <button type="button" id="machineEditCancel">Cancel</button>
//         <button type="submit" id="machineEditSave">Save</button>
//       </form>
//     </div>
//   `;

//   document.body.appendChild(modal);

//   modal.querySelector('#machineEditCancel')
//     .addEventListener('click', closeEditModal);

//   modal.querySelector('#machineEditForm')
//     .addEventListener('submit', (e) => {
//       e.preventDefault();

//       onSubmit({
//         id: modal.dataset.machineId,
//         MIGID: modal.querySelector('#machineMIGID').value.trim(),
//         gpuRaw: modal.querySelector('#machineGpu').value.trim(),
//         rowSelector: modal.dataset.rowSelector
//       });
//     });

//   return modal;
// }


// export function openEditModal(modal, machine, tableRow) {
//   modal.style.display = 'flex';

//   modal.dataset.machineId = machine._id || '';

//   const rowId = `machine-row-${machine._id || Math.random().toString(36).slice(2)}`;
//   tableRow.setAttribute('data-machine-row-id', rowId);
//   modal.dataset.rowSelector = `[data-machine-row-id="${rowId}"]`;

//   modal.querySelector('#machineMIGID').value = machine.MIGID || '';
//   modal.querySelector('#machineGpu').value =
//     machine.gpuRam ?? '';
// }

// export function closeEditModal() {
//   const modal = document.getElementById('machineEditModal');
//   if (!modal) return;

//   modal.style.display = 'none';

//   delete modal.dataset.machineId;
//   delete modal.dataset.rowSelector;

//   const form = modal.querySelector('#machineEditForm');
//   if (form) form.reset();
// }


// ---------------- ADD MODAL ----------------
export function ensureAddModal(onSubmit) {
  if (document.getElementById('machineAddModal'))
    return document.getElementById('machineAddModal');

  const modal = document.createElement('div');
  modal.id = 'machineAddModal';

  Object.assign(modal.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.4)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center'
  });
modal.innerHTML = `
  <div class="machine-modal">
    <h2>Add Machine</h2>

    <form id="machineAddForm">

      <div class="form-group">
        <label for="addMIGID">MIG ID</label>
        <input id="addMIGID" placeholder="e.g. MIG-00123" />
      </div>

      <div class="form-group">
        <label for="addGpuRam">GPU RAM (GB)</label>
        <input id="addGpuRam" type="number" placeholder="e.g. 16" />
      </div>

      <div class="form-group">
        <label for="addRam">System RAM (GB)</label>
        <input id="addRam" type="number" placeholder="e.g. 64" />
      </div>

      <div class="form-group">
        <label for="addIp">IP Address</label>
        <input id="addIp" placeholder="e.g. 192.168.1.10" />
      </div>

      <div class="form-group">
        <label for="addPort">Port</label>
        <input id="addPort" type="number" placeholder="e.g. 22" />
      </div>

      <div class="form-group">
        <label for="addUser">SSH User</label>
        <input id="addUser" placeholder="e.g. ubuntu" />
      </div>

      <div class="form-group">
        <label for="addName">Machine Name</label>
        <input id="addName" placeholder="e.g. gpu-machine-1" />
      </div>

      <div class="form-group">
        <label for="addToken">Token</label>
        <input id="addToken" placeholder="Enter secure token" />
      </div>

      <div class="machine-modal-actions">
        <button type="button" id="machineAddCancel">Cancel</button>
        <button type="submit">Save</button>
      </div>

    </form>
  </div>
`;
  document.body.appendChild(modal);

  modal.querySelector('#machineAddCancel')
  .addEventListener('click', closeAddModal);

  modal.querySelector('#machineAddForm')
    .addEventListener('submit', (e) => {
      e.preventDefault();

    onSubmit({
        MIGID: modal.querySelector('#addMIGID').value.trim(),
        gpuRaw: modal.querySelector('#addGpuRam').value.trim(),
        ramRaw: modal.querySelector('#addRam').value.trim(),
        ip: modal.querySelector('#addIp').value.trim(),
        portRaw: modal.querySelector('#addPort').value.trim(),
        user: modal.querySelector('#addUser').value.trim(),
        name: modal.querySelector('#addName').value.trim(),
        token: modal.querySelector('#addToken').value.trim()
      });
    });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAddModal();
  });

  return modal;
}


export function openAddModal(modal) {
  modal.style.display = 'flex';
  const first = modal.querySelector('input');
  if (first) first.focus();
}

export function closeAddModal() {
  const modal = document.getElementById('machineAddModal');
  if (!modal) return;

  modal.style.display = 'none';

  const form = modal.querySelector('#machineAddForm');
  if (form) form.reset();
}