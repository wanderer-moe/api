import { Router } from "itty-router";
import { errorHandler } from "@/middleware/errorHandler";
import { responseHeaders } from "@/lib/responseHeaders";
import { getContributors } from "@/routes/discord/contributors";
import { getMembers } from "@/routes/discord/members";
import { index } from "@/routes/index";
import { getGameId } from "@/routes/games/getGameId";
import { getAsset } from "@/routes/games/getAsset";
import { getGames } from "@/routes/games/getGames";
import { getGeneratorGameId } from "@/routes/oc-generators/getGameId";
import { getGenerators } from "@/routes/oc-generators/getGenerators";

const router = Router();

router
    .get("/", errorHandler(index))
    .get("/games", errorHandler(getGames))
    .get("/game/:gameId", errorHandler(getGameId))
    .get("/game/:gameId/:asset", errorHandler(getAsset))
    .get("/oc-generators", errorHandler(getGenerators))
    .get("/oc-generator/:gameId", errorHandler(getGeneratorGameId))
    .get("/discord/contributors", errorHandler(getContributors))
    .get("/discord/members", errorHandler(getMembers))
    .all("*", (): Response => {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "404 Not Found",
            }),
            {
                headers: responseHeaders,
            }
        );
    });

addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(router.handle(event.request));
});

export { router };
