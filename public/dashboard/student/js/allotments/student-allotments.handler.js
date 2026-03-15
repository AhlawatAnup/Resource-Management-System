import * as service from './student-allotments.service.js';
import * as ui from './student-allotments.ui.js';

export async function handleLoadMachines(container, content) {
    try {
        const machines = await service.fetchMachines();
        ui.renderMachines(container, machines);

        container.addEventListener('click', async (e) => {
            const item = e.target.closest('.machine-bar-item');
            if (!item) return;

            const alreadySelected = item.classList.contains('selected');
            container.querySelectorAll('.machine-bar-item').forEach(el => el.classList.remove('selected'));

            if (!alreadySelected) {
                item.classList.add('selected');
                await handleLoadAllotments(item.dataset.machineId, content);
            } else {
                ui.showEmptyAllotments(content);
            }
        });
    } catch (err) {
        console.error('Error loading machines:', err);
        ui.showError(container, 'Could not load machines.');
    }
}

export async function handleLoadAllotments(machineId, content) {
    ui.showLoadingAllotments(content);
    try {
        const data = await service.fetchMachineAllotments(machineId);
        ui.renderAllotments(content, data);
    } catch (err) {
        console.error('Error loading allotments:', err);
        ui.showError(content, 'Could not load allotments.');
    }
}