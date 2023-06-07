// handler.js

import { Router } from "itty-router";
import { getGames, getGameId, getAsset } from "./routes/games.js";
import { getGenerators, getGeneratorGameId } from "./routes/ocGenerators.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { responseHeaders } from "./lib/responseHeaders.js";
import { getContributors } from "./routes/discord.js";
import { index } from "./routes/index.js";

const router = Router();

router
    .get("/", errorHandler(index))
    .get("/games", errorHandler(getGames))
    .get("/game/:gameId", errorHandler(getGameId))
    .get("/game/:gameId/:asset", errorHandler(getAsset))
    .get("/oc-generators", errorHandler(getGenerators))
    .get("/oc-generator/:gameId", errorHandler(getGeneratorGameId))
    .get("/discord/contributors", errorHandler(getContributors))
    .all(
        "*",
        () =>
            new Response(
                JSON.stringify({
                    success: false,
                    status: "error",
                    error: "404 Not Found",
                }),
                {
                    headers: responseHeaders,
                }
            )
    );

addEventListener("fetch", (event) => {
    event.respondWith(router.handle(event.request));
});

export { router };
