// helper function to create a 404 Not Found response
export function createNotFoundResponse(c, errorMessage, responseHeaders) {
    c.status(200)
    return c.json(
        {
            success: false,
            status: "error",
            error: errorMessage,
        },
        responseHeaders
    )
}
