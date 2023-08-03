import { Router } from "itty-router";
import { errorHandler } from "@/middleware/errorHandler";
import { responseHeaders } from "@/lib/responseHeaders";
import { getContributors } from "@/routes/discord/contributors";
import { index } from "@/routes";
import { getGenerator } from "@/routes/oc-generators/getGenerator";
import { getGenerators } from "@/routes/oc-generators/getGenerators";
import { getAssetSearch, getRecentAssets } from "@/routes/search/assetSearch";
import { downloadFile } from "@/routes/download/downloadFile";
import { getUserByUsername } from "@/routes/user/getUserByUsername";
import { getUserBySearch } from "@/routes/user/getUsersBySearch";
import { allGames } from "@/routes/games/allGames";
import { getAssetFromId } from "@/routes/asset/getAssetFromId";
import { createNotFoundResponse } from "@/lib/helpers/responses/notFoundResponse";
// import { login } from "@/routes/auth/login";
// import { logout } from "@/routes/auth/logout";
// import { signup } from "@/routes/auth/signup";

const router = Router();

router
    .get("/", errorHandler(index))
    .get("/games", errorHandler(allGames))
    .get("/user/:name", errorHandler(getUserByUsername))
    .get("/recent", errorHandler(getRecentAssets))
    .get("/asset/:id", errorHandler(getAssetFromId))
    .get("/user/s/:name", errorHandler(getUserBySearch))
    .get("/search/assets", errorHandler(getAssetSearch))
    .get("/download/:id", errorHandler(downloadFile))
    .get("/oc-generators", errorHandler(getGenerators))
    .get("/oc-generator/:gameId", errorHandler(getGenerator))
    .get("/discord/contributors", errorHandler(getContributors))
    // .post("/auth/login", errorHandler(login))
    // .post("/auth/logout", errorHandler(logout))
    // .post("/auth/signup", errorHandler(signup))
    .all("*", (): Response => {
        return createNotFoundResponse("Route doesn't exist", responseHeaders);
    });

addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(router.handle(event.request));
});

export { router };
