importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB_gWuBSrztt5QMIzb7OKyBbfGHnDLDbE4",
  authDomain: "afsana-c363c.firebaseapp.com",
  projectId: "afsana-c363c",
  storageBucket: "afsana-c363c.appspot.com",
  messagingSenderId: "790999171285",
  appId: "1:790999171285:web:7e8d2afbc23b6c404ae25c",
  measurementId: "G-J7W8SRPJTD"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || "New notification";
  const options = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: payload.notification?.icon || "/favicon.ico",
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then( windowClients => {
    for (let client of windowClients) {
      if (client.url === url && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});