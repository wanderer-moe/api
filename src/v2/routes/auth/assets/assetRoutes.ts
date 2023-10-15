import { approveAsset } from "./approveAsset"
import { getUnapprovedAssets } from "./getUnapprovedAssets"
import { modifyAssetData } from "./modifyAsset"
import { uploadAsset } from "./uploadAsset"
import { Hono } from "hono"
import { cors } from "hono/cors"
import collectionsRoute from "./collections/collectionsRoutes"
import favoriteAssetRoute from "./favorite/favoriteAssetRoutes"

const assetRoute = new Hono<{ Bindings: Bindings }>()

assetRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

assetRoute.get("/unapproved", async (c) => {
    return getUnapprovedAssets(c)
})

assetRoute.post("/approve/:assetIdToApprove", async (c) => {
    return approveAsset(c)
})

assetRoute.post("/modify/:assetIdToModify", async (c) => {
    return modifyAssetData(c)
})

assetRoute.post("/upload", async (c) => {
    return uploadAsset(c)
})

assetRoute.route("/collections", collectionsRoute)
assetRoute.route("/favorite", favoriteAssetRoute)

export default assetRoute
