import { Hono } from "hono"
import { getAssetFromId } from "./getAssetFromId"
import { downloadAsset } from "./downloadAsset"
import { Bindings } from "@/worker-configuration"

const assetRoute = new Hono<{ Bindings: Bindings }>()

assetRoute.get("/:id", async (c) => {
    return getAssetFromId(c)
})

// setting both of these to id returns "duplicate param name" error, will fix later
assetRoute.get("/download/:assetId", async (c) => {
    return downloadAsset(c)
})

export default assetRoute
