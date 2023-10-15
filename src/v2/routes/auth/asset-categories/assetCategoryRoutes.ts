import { createAssetCategory } from "./createAssetCategory"
import { deleteAssetCategory } from "./deleteAssetCategory"
import { Hono } from "hono"
import { cors } from "hono/cors"

const assetCategoryRoute = new Hono<{ Bindings: Bindings }>()

assetCategoryRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

assetCategoryRoute.post("/create", async (c) => {
    return createAssetCategory(c)
})

assetCategoryRoute.post("/delete", async (c) => {
    return deleteAssetCategory(c)
})

export default assetCategoryRoute
