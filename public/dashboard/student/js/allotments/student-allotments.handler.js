import { MachineService } from './student-allotments.service.js';
import { DataUtils } from '../student.utils.js';
import { PageUI } from './student-allotments.ui.js';
import { CalendarUI } from './student-allotments-calendar.ui.js';

export const AllotmentsHandler = {
  async init() {
    try {
      const machines = await MachineService.getMachines();
      PageUI.renderMachineList(machines, (machine) => this.loadMachineSchedule(machine));
    } catch (error) {
      console.error("App Init Error:", error);
    }
  },

  async loadMachineSchedule(machine) {
    PageUI.updateView(machine.MIGID);
    
    try {
      const data = await MachineService.getAllotments(machine._id);
      const disabledDates = DataUtils.formatAllotments(data.allotments);
      
      // Initialize the separate Calendar UI
      CalendarUI.init("#inline-calendar-anchor", disabledDates);
    } catch (error) {
      console.error("Schedule Load Error:", error);
      Swal.fire('Error', 'Unable to fetch machine schedule', 'error');
    }
  }
};