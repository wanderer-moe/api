import { Hono } from "hono"
import { cors } from "hono/cors"
import { favoriteAsset } from "./add-favorite-asset"
import { removeFavoriteAsset } from "./remove-favorite-asset"
import { viewFavoriteAssets } from "./view-favorite-assets"

const favoriteAssetRoute = new Hono<{ Bindings: Bindings }>()

favoriteAssetRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

favoriteAssetRoute.post("/add", async (c) => {
    return favoriteAsset(c)
})

favoriteAssetRoute.post("/remove", async (c) => {
    return removeFavoriteAsset(c)
})

favoriteAssetRoute.get("/all", async (c) => {
    return viewFavoriteAssets(c)
})

export default favoriteAssetRoute
