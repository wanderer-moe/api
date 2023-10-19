import { addAssetToCollection } from "./add-asset-to-collection"
import { createAssetCollection } from "./create-asset-collection"
import { deleteAssetCollection } from "./delete-asset-collection"
import { deleteAssetFromCollection } from "./delete-asset-from-collection"
import { viewAssetCollection } from "./view-asset-collection"
import { viewAssetCollections } from "./view-asset-collections"
import { Hono } from "hono"
import { cors } from "hono/cors"

const collectionsRoute = new Hono<{ Bindings: Bindings }>()

collectionsRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

collectionsRoute.post("/create", async (c) => {
    return createAssetCollection(c)
})

collectionsRoute.post("/delete", async (c) => {
    return deleteAssetCollection(c)
})

collectionsRoute.post("/add", async (c) => {
    return addAssetToCollection(c)
})

collectionsRoute.post("/remove", async (c) => {
    return deleteAssetFromCollection(c)
})

collectionsRoute.get("/all", async (c) => {
    return viewAssetCollections(c)
})

collectionsRoute.get("/:collectionId", async (c) => {
    return viewAssetCollection(c)
})

export default collectionsRoute
