// admin-machines.main.js
import * as ui from './admin-machines.ui.js';
import * as service from './admin-machines.service.js';
import * as utils from './admin-machines.utils.js';
import { handleLogout } from '../../../common/js/commons.js';  //for html logout
import { 
  handleDelete, 
  handleRevoke, 
  handleEnable,
  // handleEdit, 
  // handleEditSubmit, 
  handleAddSubmit 
} from './admin-machines.handler.js';

document.addEventListener('DOMContentLoaded', () => {
  let currentFilter = 'all';

  // ---------------- INIT UI ----------------
  const tableWrapper = ui.createTableWrapper();

  const uiRefs = ui.initUI({
    onFilterChange: (f) => {
      currentFilter = f;
      loadMachines(f);
    },
    onAddClick: () => {
      const modal = ui.ensureAddModal((data) => handleAddSubmit(data, loadMachines));
      ui.openAddModal(modal);
    }
  });

  // ---------------- LOAD MACHINES ----------------
  async function loadMachines(filter = currentFilter) {
    try {
      const json = await service.fetchMachines();
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
        onRevoke: (machine, revokeBtn) => handleRevoke(machine, revokeBtn, loadMachines),
        onEnable: (machine, enableBtn) => handleEnable(machine, enableBtn, loadMachines)
      });

    } catch (err) {
      console.error('Failed to load machines', err);
    }
  }

  // ---------------- INIT ----------------
  loadMachines();
});