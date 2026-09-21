export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error);
        });
    });
  } else if ('serviceWorker' in navigator) {
    // In dev mode, register sw as well for offline testing if supported
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker Dev] Registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[Service Worker Dev] SW register skipped or failed:', error);
        });
    });
  }
}
