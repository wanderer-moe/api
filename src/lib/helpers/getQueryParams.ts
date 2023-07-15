export function getQueryParam(url, param) {
    const value = url.searchParams.get(param);
    return value ? value.split(",") : [];
}
