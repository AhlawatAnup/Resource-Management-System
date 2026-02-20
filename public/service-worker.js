// Basic Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If any client is focused and visible, do not show notification
      let isVisible = false;
      for (const client of clientList) {
        // Some browsers support client.visibilityState, some don't
        if (client.focused || client.visibilityState === 'visible') {
          isVisible = true;
          break;
        }
      }
      if (!isVisible) {
        const title = 'Notification';
        const options = {
          body: 'You have a new notification.'
        };
        return self.registration.showNotification(title, options);
      }
      // If visible, do nothing
      return Promise.resolve();
    })
  );
});
