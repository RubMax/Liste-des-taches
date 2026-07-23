// service-worker.js
// Ce Service Worker permet les notifications même lorsque la page est fermée

const CACHE_NAME = 'task-manager-v1';
const OFFLINE_URL = 'index.html';

// Installer le Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache ouvert');
        return cache.addAll([
          '/',
          '/index.html',
          // Ajoute ici les autres ressources si nécessaire
          // '/style.css',
          // '/icon.png'
        ]);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// Activer le Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(function() {
      return self.clients.claim();
    })
  );
});

// Intercepter les requêtes pour le mode hors-ligne
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - retourner la réponse
        if (response) {
          return response;
        }
        return fetch(event.request).catch(function() {
          // Si hors-ligne, retourner la page offline
          return caches.match(OFFLINE_URL);
        });
      })
  );
});

// ============================================
// GESTION DES NOTIFICATIONS EN ARRIÈRE-PLAN
// ============================================

// Écouter les messages depuis la page principale
self.addEventListener('message', function(event) {
  console.log('Service Worker: Message reçu', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    // Afficher une notification
    const options = {
      body: event.data.body || 'Rappel de tâche',
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [200, 100, 200],
      data: {
        url: event.data.url || '/',
        taskId: event.data.taskId || null
      },
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Ouvrir'
        },
        {
          action: 'dismiss',
          title: 'Fermer'
        }
      ]
    };

    self.registration.showNotification(
      event.data.title || '🔔 Rappel',
      options
    );
  }
});

// Gérer les notifications push (si vous utilisez push)
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push reçu');
  
  let data = {
    title: '🔔 Rappel',
    body: 'Vous avez une tâche à faire !',
    url: '/'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Ouvrir'
      },
      {
        action: 'dismiss',
        title: 'Fermer'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification cliquée', event.notification.data);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  const urlToOpen = data.url || '/';

  // Fermer la notification
  notification.close();

  if (action === 'dismiss') {
    return;
  }

  // Ouvrir ou mettre au premier plan la page
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(clientList) {
      // Vérifier si une page est déjà ouverte
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle page
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Gérer la fermeture des notifications
self.addEventListener('notificationclose', function(event) {
  console.log('Service Worker: Notification fermée', event.notification);
});

// ============================================
// GESTION DES TÂCHES EN ARRIÈRE-PLAN
// ============================================

// Fonction pour vérifier les rappels en arrière-plan
function checkRemindersInBackground() {
  // Cette fonction serait appelée par un événement périodique
  // Mais les Service Workers ne peuvent pas avoir de setInterval permanent
  // Ils sont réveillés par des événements (push, notificationclick, etc.)
  
  console.log('Service Worker: Vérification des rappels en arrière-plan');
}

// Synchronisation périodique (si disponible)
// Note: La Periodic Background Sync API n'est pas encore supportée partout
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', function(event) {
    if (event.tag === 'check-reminders') {
      event.waitUntil(checkRemindersInBackground());
    }
  });
}

// ============================================
// FONCTION POUR ENVOYER UNE NOTIFICATION DEPUIS LA PAGE
// ============================================

// Cette fonction peut être appelée depuis la page principale
// pour envoyer une notification via le Service Worker
function sendNotificationFromPage(title, body, taskId = null) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      title: title,
      body: body,
      taskId: taskId,
      url: window.location.href
    });
  } else {
    // Fallback si le Service Worker n'est pas disponible
    console.warn('Service Worker non disponible, utilisation de la notification classique');
    if (Notification.permission === 'granted') {
      new Notification(title, { body: body });
    } else {
      alert(`${title}\n${body}`);
    }
  }
}
