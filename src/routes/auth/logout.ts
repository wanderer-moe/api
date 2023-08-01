import { auth } from "@/lib/auth/lucia";

export async function logout(request: Request): Promise<Response> {
    const authRequest = auth.handleRequest(request);
    const session = await authRequest.validate();

    if (!session) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "401 Unauthorized",
            })
        );
    }

    await auth.invalidateSession(session.sessionId);
    authRequest.setSession(null);

    return new Promise((resolve) => {
        resolve(
            new Response(
                JSON.stringify({
                    success: true,
                    status: "ok",
                })
            )
        );
    });
}
