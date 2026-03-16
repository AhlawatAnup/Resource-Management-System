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
    document.getElementById('placeholder-text').style.display = 'none';
    document.getElementById('calendar-view').style.display = 'flex';
    document.getElementById('selected-machine-name').innerText = `Schedule: ${machineName}`;
  }
};