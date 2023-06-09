export function isNilOrWhitespace(str: string | null | undefined): boolean {
    return !str || !str.trim();
}

export function sanitizeString(str: string): string {
    return str.replace(/['"]/g, "");
}

export function indexOfBackwards(str: string, substring: string, start?: number): number {
    const startIndex = start ?? str.length - 1;

    for (let i = startIndex; i >= 0; i--) {
        if (str.substring(i - substring.length + 1, i + 1) === substring) {
            return i;
        }
    }
    return -1;
}

function onDocumentReady(callback: () => void) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(callback, 1);
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}    
