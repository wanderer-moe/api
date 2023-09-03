export function SplitQueryByCommas(query: string) {
	return query.split(",").map((q) => q.trim())
}
