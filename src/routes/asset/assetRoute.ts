import { Hono } from "hono"
import { getAssetFromId } from "./getAssetFromId"
import { downloadAsset } from "./downloadAsset"

const assetRoute = new Hono()

assetRoute.get("/:id", async (c) => {
    return getAssetFromId(c)
})

// setting both of these to id returns "duplicate param name" error, will fix later
assetRoute.get("/download/:assetId", async (c) => {
    return downloadAsset(c)
})

export default assetRoute
