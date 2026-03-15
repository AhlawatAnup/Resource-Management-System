export async function fetchMachines() {
    const res = await fetch('/dashboard/student/get_machines');
    if (!res.ok) throw new Error('Failed to fetch machines');
    return res.json();
}

export async function fetchMachineAllotments(machineId) {
    const res = await fetch(`/dashboard/student/allotments/${machineId}`);
    if (!res.ok) throw new Error('Failed to fetch allotments');
    return res.json();
}