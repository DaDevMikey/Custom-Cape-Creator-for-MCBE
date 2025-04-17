// Utility functions

// Generate a UUID
function generateUUID() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

// Sanitize a filename
function sanitizeFileName(name) {
    return name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
}

// Reset state to initial values
function resetState() {
    // This will be imported and set up in main.js
}

export { generateUUID, sanitizeFileName };