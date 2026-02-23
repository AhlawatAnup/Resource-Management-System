self.addEventListener('push', function(event) {
  console.log('[service-worker] Push received:', event);

  const data = event.data ? event.data.json() : { title: "Notification", body: "You have a new notification." };
  console.log('[service-worker] Push payload:', data);

  const options = {
    body: data.body,
    icon: "/icon.png", // optional
    badge: "/badge.png" // optional
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );

  if (data.type) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          console.log('[service-worker] Posting message to client:', client, data);
          client.postMessage({ type: data.type, ...data });
        });
      })
    );
  }
});