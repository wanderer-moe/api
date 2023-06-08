import { responseHeaders } from "../lib/responseHeaders.js";
import { roles, guildId } from "../lib/discord.js";

export const getContributors = async (request, env) => {
    const members = [];

    let after = null;

    while (true) {
        const response = await fetch(
            `https://discord.com/api/guilds/${guildId}/members?limit=1000${
                after ? `&after=${after}` : ""
            }`,
            {
                headers: {
                    Authorization: `Bot ${env.DISCORD_TOKEN}`,
                },
            }
        );

        const guildMembers = await response.json();

        const filteredMembers = guildMembers.filter((member) => {
            return member.roles.some((role) =>
                Object.keys(roles).includes(role)
            );
        });

        const contributors = filteredMembers.map((member) => {
            const rolesArray = member.roles
                .map((role) => roles[role])
                .filter((role) => role);

            return {
                id: member.user.id,
                username: member.user.username,
                globalname: member.user.global_name || null,
                avatar: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp`,
                roles: rolesArray,
            };
        });

        members.push(...contributors);

        if (
            !guildMembers.length ||
            !guildMembers[guildMembers.length - 1].user
        ) {
            break;
        }

        after = guildMembers[guildMembers.length - 1].user.id;
    }

    return new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            path: `/discord/contributors`,
            contributors: members,
        }),
        {
            headers: responseHeaders,
        }
    );
};
