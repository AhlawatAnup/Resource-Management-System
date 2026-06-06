import { handleLogout } from '../utils/commons.utils.js'; //for logout
import { PageUI } from './machine-availability.ui.js';
import { AllotmentsUtils } from './machine-availability.util.js';
import { CalendarUI } from './allotments-calender.js';
//import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';

//API CALLS
export function createMachineService() {
  const basePath = '/dashboard';

  return {
    async getMachines() {
      const response = await fetch(`${basePath}/get_machines`);
      if (!response.ok) throw new Error('Failed to fetch machines');
      return response.json();
    },

    async getAllotments(machineId) {
      const safeMachineId = encodeURIComponent(String(machineId));
      const response = await fetch(`${basePath}/allotments/${safeMachineId}`);
      if (!response.ok) throw new Error('Failed to fetch allotments');
      return response.json();
    },
  };
}

//HANDLER

export function createAllotmentsHandler(machineService) {
  return {
    async init() {
      try {
        const machines = await machineService.getMachines();

        for (const machine of machines) {
          try {
            const data = await machineService.getAllotments(machine._id);

            const formatted = AllotmentsUtils.formatAllotments(data.allotments);

            machine.availableFrom = AllotmentsUtils.getAvailableFrom(formatted);
          } catch (err) {
            machine.availableFrom = 'Today';
          }
        }

        PageUI.renderMachineList(machines, (machine) => this.loadMachineSchedule(machine));
      } catch (error) {
        console.error('App Init Error:', error);
      }
    },

    async loadMachineSchedule(machine) {
      PageUI.updateView(machine.MIGID);


      try {
        const data = await machineService.getAllotments(machine._id);
        const disabledDates = AllotmentsUtils.formatAllotments(data.allotments);
        CalendarUI.init('#inline-calendar-anchor', disabledDates);
      } catch (error) {
        console.error('Schedule Load Error:', error);
        if (typeof Swal !== 'undefined') {
          Swal.fire('Error', 'Unable to fetch machine schedule', 'error');
        }
      }
    },
  };
}
//INIT

function initAllotments() {
  // setupDarkMode();

  const machineService = createMachineService();
  const handler = createAllotmentsHandler(machineService);
  handler.init();
}

document.addEventListener('DOMContentLoaded', initAllotments);
