import { Hono } from "hono"
import { listAllAssetTags } from "./allTags"
import { getTagById } from "./getTagById"
import { getTagByName } from "./getTagByName"

const tagsRoute = new Hono<{ Bindings: Bindings }>()

tagsRoute.get("/all", async (c) => {
    return listAllAssetTags(c)
})

tagsRoute.get("/id/:id", async (c) => {
    return getTagById(c)
})

tagsRoute.get("/name/:name", async (c) => {
    return getTagByName(c)
})

export default tagsRoute
