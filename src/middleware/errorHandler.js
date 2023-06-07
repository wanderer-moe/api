export const errorHandler = (handler) => async (request, env) => {
    try {
        return await handler(request, env);
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "500 Internal Server Error",
            }),
            {
                headers: responseHeaders,
            }
        );
    }
};
