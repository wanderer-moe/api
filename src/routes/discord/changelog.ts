import { responseHeaders } from "@/lib/responseHeaders";
import { DiscordMessage } from "@/lib/types/discord";

export const getChangelog = async (
    request: Request,
    env: Env,
    ctx: ExecutionContext
): Promise<Response> => {
    const CHANNEL_ID = "1112527121848483920";
    const API_ENDPOINT = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=15`;

    const res = await fetch(API_ENDPOINT, {
        headers: {
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
        },
    });

    const messages = (await res.json()) as DiscordMessage[];

    return new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            path: `/discord/changelog`,
            messages,
        }),
        {
            headers: responseHeaders,
        }
    );
};
