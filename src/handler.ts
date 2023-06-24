import { Router } from "itty-router";
import { errorHandler } from "@/middleware/errorHandler";
import { responseHeaders } from "@/lib/responseHeaders";
import { getContributors } from "@/routes/discord/contributors";
import { index } from "@/routes/index";
import { getGenerator } from "@/routes/oc-generators/getGenerator";
import { getGenerators } from "@/routes/oc-generators/getGenerators";
import { getSearch, getRecentAssets } from "@/routes/search/search";
import { downloadFile } from "@/routes/download/downloadFile";
import { getUserById } from "@/routes/user/getUserById";
import { getUserBySearch } from "@/routes/user/getUsersBySearch";
import { allGames } from "@/routes/games/allGames";

const router = Router();

router
    .get("/", errorHandler(index))
    .get("/games", errorHandler(allGames))
    .get("/user/:id", errorHandler(getUserById))
    .get("/recent", errorHandler(getRecentAssets))
    .get("/user/search/:name", errorHandler(getUserBySearch))
    .get("/search", errorHandler(getSearch))
    .get("/download", errorHandler(downloadFile))
    .get("/oc-generators", errorHandler(getGenerators))
    .get("/oc-generator/:gameId", errorHandler(getGenerator))
    .get("/discord/contributors", errorHandler(getContributors))
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
