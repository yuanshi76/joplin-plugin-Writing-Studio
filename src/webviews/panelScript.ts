/**
 * Writing Studio Plugin - Project Panel Webview Script
 * Handles communication between webview and plugin
 */

// @ts-ignore - webviewApi is injected by Joplin
declare const webviewApi: any;

// Make functions available globally
(window as any).openNote = function (noteId: string) {
    webviewApi.postMessage({ type: 'openNote', noteId: noteId });
};

(window as any).executeCommand = function (command: string) {
    webviewApi.postMessage({ type: 'executeCommand', command: command });
};

(window as any).submitNote = function (noteId: string) {
    webviewApi.postMessage({ type: 'submitNote', noteId: noteId });
};

(window as any).switchTab = function (tab: string) {
    webviewApi.postMessage({ type: 'switchTab', tab: tab });
};

console.log('Writing Studio: Webview script loaded');
