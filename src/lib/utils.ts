export function isNilOrWhitespace(str: string | null | undefined): boolean {
    return !str || !str.trim();
}