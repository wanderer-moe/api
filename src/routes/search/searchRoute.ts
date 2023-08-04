import { Hono } from "hono";
import { getAssetSearch } from "./assetSearch";
import { recentAssets } from "./assetSearch";

const searchRoute = new Hono();

searchRoute.get("/assets", async (c) => {
    return getAssetSearch(c);
});

searchRoute.get("/recent", async (c) => {
    return recentAssets(c);
});

export default searchRoute;
