export function setupSWEventDispatcher() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[sw-events] message from SW:', event.data);

      window.dispatchEvent(new CustomEvent('sw-message', { detail: event.data }));
    });
  } else {
    console.warn('[sw-events] Service worker not supported');
  }
}
