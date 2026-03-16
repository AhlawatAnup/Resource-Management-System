export const PageUI = {
  renderMachineList(machines, onSelect) {
    const flexbar = document.getElementById('machines-flexbar');
    flexbar.innerHTML = ''; 

    machines.forEach((machine, index) => {
      const btn = document.createElement('div');
      btn.className = 'machine-item-card'; 
      btn.innerHTML = `
        <div class="machine-info">
          <strong style="display:block; font-size:0.8rem; line-height:1.05; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${machine.MIGID} (${machine.gpuRam} GB)
          </strong>
        </div>
      `;

      btn.onclick = () => {
        this.highlightMachine(btn);
        onSelect(machine);
      };

      flexbar.appendChild(btn);

      // Auto-click the first machine on initial load
      if (index === 0) {
        btn.click();
      }
    });
  },

  highlightMachine(selectedButton) {
    document.querySelectorAll('#machines-flexbar .machine-item-card').forEach(button => {
      button.classList.remove('selected');
    });
    selectedButton.classList.add('selected');
  },

  updateView(machineName) {
    const placeholder = document.getElementById('placeholder-text');
    const calendarView = document.getElementById('calendar-view');
    const machineTitle = document.getElementById('selected-machine-name');

    if (placeholder) placeholder.style.display = 'none';
    if (calendarView) calendarView.style.display = 'flex';
    if (machineTitle) machineTitle.innerText = `Schedule: ${machineName}`;
  }
};