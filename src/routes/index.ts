import { responseHeaders } from "@/lib/responseHeaders";

const routes: string[] = [
    "https://api.wanderer.moe/games",
    "https://api.wanderer.moe/game/{gameId}",
    "https://api.wanderer.moe/game/{gameId}/{asset}",
    "https://api.wanderer.moe/search/assets?game={game}&query={searchQuery}",
    "https://api.wanderer.moe/discord/contributors",
    "https://api.wanderer.moe/discord/members",
    "https://api.wanderer.moe/discord/changelog",
];

export const index = async (): Promise<Response> => {
    return new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            path: "/",
            routes,
        }),
        {
            headers: responseHeaders,
        }
    );
};
