// This service worker handles receiving push notifications.

self.addEventListener("push", (event) => {
  const data = event.data.json();
  console.log("Push notification received:", data);

  const title = data.title || "Thông báo chi tiêu";
  const options = {
    body: data.body || "Bạn có một thông báo mới.",
    icon: "/icon-192x192.png", // Ensure you have an icon in the public folder
    badge: "/badge-72x72.png", // And a badge icon
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // This event is fired when the user clicks on the notification.
  // It opens the app's main page.
  event.waitUntil(clients.openWindow("/"));
});
