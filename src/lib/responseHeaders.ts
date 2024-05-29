export const responseHeaders: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "content-type": "application/json;charset=UTF-8",
    "access-control-allow-origin": "*",
    "Cache-Control": `max-age=${60 * 60 * 2}`,
};
