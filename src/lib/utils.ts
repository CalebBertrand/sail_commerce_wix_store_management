export function isNilOrWhitespace(str: string | null | undefined): boolean {
    return !str || !str.trim();
}

export function sanitizeString(str: string): string {
    return str.replace(/['"]/g, "");
}
