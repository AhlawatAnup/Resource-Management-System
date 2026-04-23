import { AllotmentsUtils } from './allotments.utils.js';
import { PageUI } from './allotments.ui.js';
import { CalendarUI } from './allotments-calendar.ui.js';

export function createAllotmentsHandler(machineService) {
  return {
    async init() {
      try {
        const machines = await machineService.getMachines();
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
