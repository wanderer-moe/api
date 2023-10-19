import { Hono } from "hono"
import { getAssetFromId } from "./get-asset-from-id"
import { downloadAsset } from "./download-asset"

const assetRoute = new Hono<{ Bindings: Bindings }>()

assetRoute.get("/:id", async (c) => {
    return getAssetFromId(c)
})

// setting both of these to id returns "duplicate param name" error, will fix later
assetRoute.get("/download/:assetId", async (c) => {
    return downloadAsset(c)
})

export default assetRoute
