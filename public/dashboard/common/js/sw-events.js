export function setupSWEventDispatcher() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[sw-events.js] Received message from service worker:', event.data);
      window.dispatchEvent(new CustomEvent('sw-message', { detail: event.data }));
      console.log('[sw-events.js] Dispatched sw-message event:', event.data);
    });
  } else {
    console.warn('[sw-events.js] Service worker not supported in this browser.');
  }
}