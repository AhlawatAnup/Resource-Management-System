import { logoutDirectly } from '../../../common/js/commons.js';

document.addEventListener('DOMContentLoaded', () => {
    loadAvailableMachines();
});

async function loadAvailableMachines() {
    const container = document.getElementById('machines-flexbar');
    if (!container) return;
    try {
        const res = await fetch('/dashboard/student/get_machines');
        if (!res.ok) throw new Error('Failed to fetch machines');
        const machines = await res.json();
        if (!machines.length) {
            container.innerHTML = '<span class="machine-bar-empty">No machines available.</span>';
            return;
        }
        container.innerHTML = machines
            .map(m => `<div class="machine-bar-item" data-machine-id="${m._id}"><span class="migid">${m.MIGID}</span><span class="gpuram">(${m.gpuRam} GB)</span></div>`)
            .join('');

        container.addEventListener('click', (e) => {
            const item = e.target.closest('.machine-bar-item');
            if (!item) return;
            const alreadySelected = item.classList.contains('selected');
            container.querySelectorAll('.machine-bar-item').forEach(el => el.classList.remove('selected'));
            if (!alreadySelected) {
                item.classList.add('selected');
                loadMachineAllotments(item.dataset.machineId);
            } else {
                document.getElementById('allotments-content').innerHTML =
                    '<p class="allotments-placeholder"><i class="fas fa-arrow-left"></i> Select a machine to view its allotments.</p>';
            }
        });
    } catch (err) {
        console.error('Error loading machines:', err);
        container.innerHTML = '<span class="machine-bar-empty">Could not load machines.</span>';
    }
}

async function loadMachineAllotments(machineId) {
    const content = document.getElementById('allotments-content');
    content.innerHTML = '<p class="allotments-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading allotments...</p>';
    try {
        const res = await fetch(`/dashboard/student/allotments/${machineId}`);
        if (!res.ok) throw new Error('Failed to fetch allotments');
        const data = await res.json();
        renderAllotments(data);
    } catch (err) {
        console.error('Error loading allotments:', err);
        content.innerHTML = '<p class="allotments-placeholder">Could not load allotments.</p>';
    }
}

function renderAllotments({ machine, allotments, message }) {
    const content = document.getElementById('allotments-content');

    const title = `<h2><i class="fas fa-network-wired"></i> ${machine.MIGID} &mdash; ${machine.gpuRam} GB GPU</h2>`;

    if (!allotments || !allotments.length) {
        content.innerHTML = `${title}<p class="allotments-empty">${message || 'No allotments found for this machine.'}</p>`;
        return;
    }

    const rows = allotments.map(a => {
        const start = new Date(a.startTime).toLocaleString();
        const end = new Date(a.endTime).toLocaleString();
        const badgeClass = a.status === 'active' ? 'active' : 'expired';
        return `
            <tr>
                <td>${a.resourceRequestId}</td>
                <td>${start}</td>
                <td>${end}</td>
                <td><span class="status-badge ${badgeClass}">${a.status}</span></td>
            </tr>`;
    }).join('');

    content.innerHTML = `
        ${title}
        <table class="allotments-table">
            <thead>
                <tr>
                    <th>Request ID</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}
