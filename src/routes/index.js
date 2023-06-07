import { responseHeaders } from "../lib/responseHeaders.js";

// TODO: stop hardcoding routes
const routes = [
    "https://api.wanderer.moe/games",
    "https://api.wanderer.moe/game/{gameId}",
    "https://api.wanderer.moe/game/{gameId}/{asset}",
    "https://api.wanderer.moe/oc-generators",
    "https://api.wanderer.moe/oc-generator/{gameId}",
];

export const index = async (request, env) => {
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
