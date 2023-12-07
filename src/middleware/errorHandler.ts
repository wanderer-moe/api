import { responseHeaders } from "@/lib/responseHeaders";

export const errorHandler =
    (handler: (request: Request, env: Env) => Promise<Response>) =>
    async (request: Request, env: Env): Promise<Response> => {
        try {
            try {
                const webhookurl = env.DISCORD_LOG_WEBHOOK_URL;

                await fetch(webhookurl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: null,
                        embeds: [
                            {
                                title: "API Request Success",
                                color: 11009917,
                                fields: [
                                    {
                                        name: "Request URL",
                                        value: `${request.url}`,
                                        inline: true,
                                    },
                                    {
                                        name: "CF Colo",
                                        value: `${
                                            request.cf.colo || "Unknown"
                                        }`,
                                        inline: true,
                                    },
                                ],
                                timestamp: new Date().toISOString(),
                            },
                        ],
                        attachments: [],
                    }),
                });
            } catch (e) {
                console.error(e);
            }

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
