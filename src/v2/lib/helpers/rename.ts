/**
 * Replaces all hyphens in a string with underscores.
 * @param name - The string to rename.
 * @returns The renamed string with all hyphens replaced by underscores.
 */
export const rename = (name: string): string => {
    return name.replace(/-/g, "_")
}
