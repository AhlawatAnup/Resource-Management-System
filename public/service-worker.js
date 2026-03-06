self.addEventListener('push', function(event) {

  const data = event.data ? event.data.json() : { title: "Notification", body: "You have a new notification." };

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
          client.postMessage({ type: data.type, ...data });
        });
      })
    );
  }
});