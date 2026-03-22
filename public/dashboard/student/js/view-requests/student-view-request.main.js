// main.js

import { handleLoadViewRequests, processVerifiedRequestsForToken } from './student-view-request.handler.js';

document.addEventListener('DOMContentLoaded', async () => {
    await handleLoadViewRequests();
    processVerifiedRequestsForToken();
});