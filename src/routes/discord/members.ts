import { responseHeaders } from "@/lib/responseHeaders";
import { guildId } from "@/lib/discord";

export const getMembers = async (
    request: Request,
    env: Env
): Promise<Response> => {
    let guildStats = {
        memberCount: 2600,
        onlineCount: 350,
    };

    try {
        const res = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
            {
                headers: {
                    Authorization: `Bot ${env.DISCORD_TOKEN}`,
                },
            }
        );

        const guildData = (await res.json()) as {
            approximate_member_count: number;
            approximate_presence_count: number;
        };

        guildStats.memberCount = guildData.approximate_member_count;
        guildStats.onlineCount = guildData.approximate_presence_count;
    } catch (e) {
        console.error(e);
    }

    return new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            path: `/discord/members`,
            guild: guildStats,
        }),
        {
            headers: responseHeaders,
        }
    );
};
