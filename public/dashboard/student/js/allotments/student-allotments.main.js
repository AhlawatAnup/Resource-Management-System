import { handleLoadMachines } from './student-allotments.handler.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('machines-flexbar');
    const content = document.getElementById('allotments-content');
    if (container && content) {
        handleLoadMachines(container, content);
    }
});