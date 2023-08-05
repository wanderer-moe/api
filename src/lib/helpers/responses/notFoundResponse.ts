// helper function to create a 404 Not Found response
export function createNotFoundResponse(errorMessage, responseHeaders) {
    return new Response(
        JSON.stringify({
            success: false,
            status: "error",
            error: errorMessage,
        }),
        {
            status: 404,
            headers: responseHeaders,
        }
    );
}
