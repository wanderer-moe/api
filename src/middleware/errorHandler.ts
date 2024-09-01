import { responseHeaders } from "@/lib/responseHeaders";

export const errorHandler =
    (
        handler: (
            request: Request,
            env: Env,
            ctx: ExecutionContext
        ) => Promise<Response>
    ) =>
    async (
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> => {
        try {
            return await handler(request, env, ctx);
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
