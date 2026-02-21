self.addEventListener('push', function(event) {
  console.log("Push received:", event);

  const data = event.data ? event.data.json() : { title: "Notification", body: "You have a new notification." };

  const options = {
    body: data.body,
    icon: "/icon.png", // optional
    badge: "/badge.png" // optional
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});