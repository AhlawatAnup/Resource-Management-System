import { formatDateTime } from '../student.utils.js';

export function renderMachines(container, machines) {
    if (!machines.length) {
        container.innerHTML = '<span class="machine-bar-empty">No machines available.</span>';
        return;
    }

    container.innerHTML = machines
        .map(m => `<div class="machine-bar-item" data-machine-id="${m._id}">
            <span class="migid">${m.MIGID}</span>
            <span class="gpuram">(${m.gpuRam} GB)</span>
        </div>`).join('');
}

export function renderAllotments(content, { machine, allotments, message }) {
    const title = `<h2><i class="fas fa-network-wired"></i> ${machine.MIGID} &mdash; ${machine.gpuRam} GB GPU</h2>`;

    if (!allotments || !allotments.length) {
        content.innerHTML = `${title}<p class="allotments-empty">${message || 'No allotments found for this machine.'}</p>`;
        return;
    }

    const rows = allotments.map(a => {
        const start = formatDateTime(a.startTime);
        const end = formatDateTime(a.endTime);
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

export function showLoadingAllotments(content) {
    content.innerHTML = '<p class="allotments-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading allotments...</p>';
}

export function showEmptyAllotments(content) {
    content.innerHTML = '<p class="allotments-placeholder"><i class="fas fa-arrow-left"></i> Select a machine to view its allotments.</p>';
}

export function showError(container, message) {
    container.innerHTML = `<span class="machine-bar-empty">${message}</span>`;
}