import { Router } from "itty-router";
import { errorHandler } from "@/middleware/errorHandler";
import { responseHeaders } from "@/lib/responseHeaders";
import { getContributors } from "@/routes/discord/contributors";
import { index } from "@/routes/index";
import { getGeneratorGameId } from "@/routes/oc-generators/getGameId";
import { getGenerators } from "@/routes/oc-generators/getGenerators";
import { getSearch } from "@/routes/search/search";

const router = Router();

router
    .get("/", errorHandler(index))
    .get("/oc-generators", errorHandler(getGenerators))
    .get("/oc-generator/:gameId", errorHandler(getGeneratorGameId))
    .get("/discord/contributors", errorHandler(getContributors))
    .get("/search", errorHandler(getSearch))
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
