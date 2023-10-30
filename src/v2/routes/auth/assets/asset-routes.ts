import { approveAsset } from "./approve-asset"
import { getUnapprovedAssets } from "./get-unapproved-assets"
import { modifyAssetData } from "./modify-asset"
import { uploadAsset } from "./upload-asset"
import { Hono } from "hono"
import { cors } from "hono/cors"
import collectionsRoute from "./collections/collections-routes"
import favoriteAssetRoute from "./favorite/favorite-asset-routes"

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
