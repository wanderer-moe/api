import { responseHeaders } from "@/lib/responseHeaders";

// generic error handler wrapper
export const errorHandler =
    (handler: (request: Request, env: Env) => Promise<Response>) =>
    async (request: Request, env: Env): Promise<Response> => {
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
                    status: 500,
                    headers: responseHeaders,
                }
            );
        }
    };
