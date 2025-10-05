document.addEventListener('DOMContentLoaded', () => {
  const importBtn = document.getElementById('importCsvBtn');
  const importInput = document.getElementById('importCsvInput');

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

  importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic client-side check
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
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
        alert('Import failed: ' + (json.error || resp.statusText));
      } else {
        const msg = `Imported: ${json.imported} / ${json.total}`;
        if (json.skipped && json.skipped.length) {
          alert(msg + '\nSkipped rows: ' + json.skipped.length + '\nCheck console for details');
          console.log('Skipped rows:', json.skipped);
        } else {
          alert(msg);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Upload error: ' + err.message);
    } finally {
      importBtn.disabled = false;
      importBtn.textContent = 'Import CSV';
      importInput.value = '';
      // refresh list after import
      loadMachines();
    }
  });

  // load machines and render simple table
  async function loadMachines() {
    try {
      const resp = await fetch('/dashboard/admin/machines', { credentials: 'include' });
      if (!resp.ok) return;
      const json = await resp.json();
      renderTable(json.machines || []);
    } catch (err) { console.error('Failed to load machines', err); }
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
    ['MIGID','cpuCores','cpuRam','gpuRam'].forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    machines.forEach(m => {
      const tr = document.createElement('tr');
      [m.MIGID, m.cpuCores, m.cpuRam, m.gpuRam].forEach(val => {
        const td = document.createElement('td');
        td.textContent = val === undefined ? '' : val;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
    wrapper.appendChild(container);
  }

  loadMachines();
});
