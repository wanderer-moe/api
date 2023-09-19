/**
 * Splits a query string by commas and trims each resulting string.
 * @param query - The query string to split.
 * @returns An array of strings resulting from splitting the query string by commas and trimming each resulting string.
 */
export function SplitQueryByCommas(query: string): string[] {
    return query.split(",").map((q) => q.trim())
}
