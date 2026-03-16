export const MachineService = {
  async getMachines() {
    const response = await fetch('/dashboard/student/get_machines');
    if (!response.ok) throw new Error("Failed to fetch machines");
    return await response.json();
  },

  async getAllotments(machineId) {
    const response = await fetch(`/dashboard/student/allotments/${machineId}`);
    if (!response.ok) throw new Error("Failed to fetch allotments");
    return await response.json();
  }
};