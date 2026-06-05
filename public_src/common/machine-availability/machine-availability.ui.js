export const PageUI = {
  renderMachineList(machines, onSelect) {
    const flexbar = document.getElementById('machines-flexbar');
    flexbar.innerHTML = '';

    machines.forEach((machine, index) => {
      const btn = document.createElement('div');
      btn.className = 'machine-item-card';
      btn.innerHTML = `
       <div style="
  border-bottom: 1px solid #e5e7eb;
  padding: 18px 0;
  margin: 0;
  flex-shrink: 0;
">

  <p style="
    font-size: 14px;
    font-weight: 400;
    color: #111827;
    margin: 0 0 18px 0;
  ">
    ${machine.MIGID}
  </p>

  <div style="
    display: flex;
    align-items: center;
    gap: 28px;
    flex-wrap: nowrap;
  ">

    <!-- GPU -->
    <div style="display:flex; align-items:center; gap:10px;">

      <div style="
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #e8f5e9;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-shrink:0;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#43a047" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <rect x="9" y="9" width="6" height="6"/>
          <line x1="9" y1="2" x2="9" y2="4"/>
          <line x1="15" y1="2" x2="15" y2="4"/>
          <line x1="9" y1="20" x2="9" y2="22"/>
          <line x1="15" y1="20" x2="15" y2="22"/>
          <line x1="2" y1="9" x2="4" y2="9"/>
          <line x1="2" y1="15" x2="4" y2="15"/>
          <line x1="20" y1="9" x2="22" y2="9"/>
          <line x1="20" y1="15" x2="22" y2="15"/>
        </svg>
      </div>

      <div>
        <p style="
          font-size: 12px;
          color: #6b7280;
          margin:0;
          white-space: nowrap;
        ">
          GPU RAM
        </p>

        <p style="
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          margin:0;
        ">
          ${machine.gpuRam}GB
        </p>
      </div>

    </div>

    <!-- RAM -->
    <div style="display:flex; align-items:center; gap:10px;">

      <div style="
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #e3f2fd;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-shrink:0;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e88e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/>
        </svg>
      </div>

      <div>
        <p style="
          font-size: 12px;
          color: #6b7280;
          margin:0;
          white-space: nowrap;
        ">
          RAM
        </p>

        <p style="
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          margin:0;
        ">
          ${machine.ram}GB
        </p>
      </div>

    </div>

    <!-- Available -->
    <div style="display:flex; align-items:center; gap:10px;">

      <div style="
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #ede7f6;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-shrink:0;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7e57c2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>

      <div>
        <p style="
          font-size: 12px;
          color: #6b7280;
          margin:0;
          white-space: nowrap;
        ">
          Available From
        </p>

        <p style="
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          margin:0;
        ">
          ${machine.availableFrom}
        </p>
      </div>

    </div>

  </div>

</div>
      `;

      btn.onclick = () => {
        this.highlightMachine(btn);
        onSelect(machine);
      };

      flexbar.appendChild(btn);

      if (index === 0) {
        btn.click();
      }
    });
  },

  highlightMachine(selectedButton) {
    document.querySelectorAll('#machines-flexbar .machine-item-card').forEach((button) => {
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
    if (machineTitle) machineTitle.innerText = `${machineName}`;
  },
};
