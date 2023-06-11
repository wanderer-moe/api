// handler.js

import { Router } from "itty-router";
import { errorHandler } from "./middleware/errorHandler.js";
import { responseHeaders } from "./lib/responseHeaders.js";
import { getContributors } from "./routes/discord/contributors.js";
import { index } from "./routes/index.js";
import { getGameId } from "./routes/games/getGameId.js";
import { getAsset } from "./routes/games/getAsset.js";
import { getGames } from "./routes/games/getGames.js";
import { getGeneratorGameId } from "./routes/oc-generators/getGameId.js";
import { getGenerators } from "./routes/oc-generators/getGenerators.js";

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
