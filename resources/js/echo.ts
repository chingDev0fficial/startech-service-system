import { configureEcho } from "@laravel/echo-react";

console.log("[Echo Init] Starting initialization...");

try {
    configureEcho({
        broadcaster: "reverb",
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: window.location.hostname, // This will adapt to your current host
        wsPort: parseInt(import.meta.env.VITE_REVERB_PORT as string),
        wssPort: parseInt(import.meta.env.VITE_REVERB_PORT as string),
        forceTLS: window.location.protocol === 'https:',
        enabledTransports: ['ws', 'wss'],
        debug: true, // Enable debugging
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            }
        }
    });
} catch (error) {
    console.error("[Echo Init] Failed to configure Echo:", error);
}