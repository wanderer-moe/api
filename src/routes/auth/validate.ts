import { auth } from "@/lib/auth/lucia";
import { responseHeaders } from "@/lib/responseHeaders";

export const validate = async (request: Request): Promise<Response> => {
    const authRequest = auth.handleRequest(request);
    const session = await authRequest.validate();

    // TODO: in-depth error handling

    if (!session) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "401 Unauthorized",
            }),
            {
                status: 401,
                headers: responseHeaders,
            }
        );
    }

    return new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            session,
        }),
        {
            headers: responseHeaders,
        }
    );
};
