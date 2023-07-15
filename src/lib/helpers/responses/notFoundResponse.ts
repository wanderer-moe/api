export function createNotFoundResponse(errorMessage, responseHeaders) {
    const responseBody = {
        success: false,
        status: "error",
        error: "404 Not Found",
        message: errorMessage,
    };

    return new Response(JSON.stringify(responseBody), {
        headers: responseHeaders,
    });
}
