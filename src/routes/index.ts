import { responseHeaders } from "@/lib/responseHeaders";

const routes: string[] = [
    "https://api.wanderer.moe/games",
    "https://api.wanderer.moe/game/{gameId}",
    "https://api.wanderer.moe/game/{gameId}/{asset}",
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
