import * as common_utils from '../../../../common/utils/commons.utils.js';
import Swal from 'sweetalert2';

// ---------------- INIT UI ----------------
export function initUI({ onFilterChange, onAddClick }) {
  const addBtn = document.getElementById('addMachineBtn');

  if (addBtn) addBtn.addEventListener('click', onAddClick);

  const filterButtons = document.querySelectorAll('.machines-filters .status-btn');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      onFilterChange(btn.dataset.filter || 'all');
    });
  });

  return {};
}

// ---------------- TABLE WRAPPER ----------------
export function createTableWrapper() {
  const machinePage = document.querySelector('.main.machine');

  if (!machinePage) return null;

  const tableWrapper = document.createElement('div');
  tableWrapper.id = 'machinesTableWrapper';
  tableWrapper.className = 'machines-table-page';
  tableWrapper.style.margin = '16px 0';

  let mainContent = machinePage.querySelector('.rms-table');

  if (!mainContent) {
    mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    machinePage.appendChild(mainContent);
  }

  mainContent.appendChild(tableWrapper);

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
  container.className = 'machine-table-page';

  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['MIGID', 'gpuRam', 'ram', 'ip:port', 'name', 'Action'].forEach((h) => {
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

    // MIGID column (with user as title)
    const migTd = document.createElement('td');
    migTd.textContent = m.MIGID ?? '';
    migTd.title = m.user ?? '-';
    tr.appendChild(migTd);

    // Remaining columns
    const rowVals = [m.gpuRam, m.ram, m.ip && m.port ? `${m.ip}:${m.port}` : m.ip || '', m.name];
    rowVals.forEach((val) => {
      const td = document.createElement('td');
      td.textContent = val === undefined ? '' : val;
      tr.appendChild(td);
    });

    // Action buttons cell
    const actionTd = document.createElement('td');
    // Delete button
    const deleteBtn = createBtn('Delete', () => handlers.onDelete(m, tr));
    deleteBtn.style.background = '#991b1b';
    deleteBtn.style.color = 'white';
    deleteBtn.style.border = 'none';
    deleteBtn.style.padding = '7px 14px';
    deleteBtn.style.fontSize = '11px';
    deleteBtn.style.fontWeight = '500';
    deleteBtn.style.borderRadius = '8px';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';

    deleteBtn.title = 'Deleting this machine is irreversible. All related data will be lost!';
    actionTd.appendChild(deleteBtn);
    let actionBtn;
    if (m.isAvailable) {
      actionBtn = createBtn('Disable', function () {
        handlers.onRevoke(m, actionBtn);
      });
      actionBtn.style.background = '#b91c1c'; // same as reject
      actionBtn.style.color = 'white';
      actionBtn.style.border = 'none';
      actionBtn.style.padding = '7px 14px';
      actionBtn.style.fontSize = '11px';
      actionBtn.style.fontWeight = '500';
      actionBtn.style.borderRadius = '8px';
      actionBtn.style.border = 'none';
      actionBtn.style.cursor = 'pointer';

      actionBtn.title =
        'Disabling this machine will prevent users from using it until it is re-enabled. New allotments cannot be made while disabled.';
    } else {
      actionBtn = createBtn('Enable', function () {
        handlers.onEnable(m, actionBtn);
      });
      actionBtn.style.background = '#166534'; // same as approve
      actionBtn.style.color = 'white';
      actionBtn.style.border = 'none';
      actionBtn.style.padding = '7px 14px';
      actionBtn.style.fontSize = '11px';
      actionBtn.style.fontWeight = '500';
      actionBtn.style.borderRadius = '8px';
      actionBtn.style.border = 'none';
      actionBtn.style.cursor = 'pointer';
      actionBtn.title =
        'Enabling this machine will allow users to use it again and new allotments can be made.';
    }

    actionBtn.style.marginLeft = '8px';
    actionBtn.style.color = '#fff';

    actionTd.appendChild(actionBtn);
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
  if (document.getElementById('machineAddModal')) return document.getElementById('machineAddModal');

  const modal = document.createElement('div');
  modal.id = 'machineAddModal';

  Object.assign(modal.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.4)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
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
        <label for="addUser">User</label>
        <input id="addUser" placeholder="e.g. user8" />
      </div>

      <div class="form-group">
        <label for="addName">Parent Machine Name</label>
        <input id="addName" placeholder="e.g. H100" />
      </div>

      <div class="machine-modal-actions">
        <button type="button" id="machineAddCancel">Cancel</button>
        <button type="submit">Save</button>
      </div>

    </form>
  </div>
`;
  document.body.appendChild(modal);

  modal.querySelector('#machineAddCancel').addEventListener('click', closeAddModal);

  modal.querySelector('#machineAddForm').addEventListener('submit', (e) => {
    e.preventDefault();

    onSubmit({
      MIGID: modal.querySelector('#addMIGID').value.trim(),
      gpuRaw: modal.querySelector('#addGpuRam').value.trim(),
      ramRaw: modal.querySelector('#addRam').value.trim(),
      ip: modal.querySelector('#addIp').value.trim(),
      portRaw: modal.querySelector('#addPort').value.trim(),
      user: modal.querySelector('#addUser').value.trim(),
      name: modal.querySelector('#addName').value.trim(),
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
