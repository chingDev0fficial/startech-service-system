import { configureEcho } from "@laravel/echo-react";

console.log("[Echo Init] Starting initialization...");

try {
    configureEcho({
        broadcaster: "reverb",
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: window.location.hostname,
        wsPort: parseInt(import.meta.env.VITE_REVERB_PORT as string),
        wssPort: parseInt(import.meta.env.VITE_REVERB_PORT as string),
        forceTLS: window.location.protocol === 'https:',
        enabledTransports: ['ws', 'wss'],
        debug: true,
        disableStats: true, // Add this to disable statistics
        encrypted: true, // Add encryption
        cluster: import.meta.env.VITE_REVERB_APP_CLUSTER, // Add cluster configuration
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'X-Requested-With': 'XMLHttpRequest' // Add this header
            }
        },
        authEndpoint: '/broadcasting/auth', // Specify the auth endpoint explicitly
    });

    console.log("[Echo Init] Configuration successful");
} catch (error) {
    console.error("[Echo Init] Failed to configure Echo:", error);
}