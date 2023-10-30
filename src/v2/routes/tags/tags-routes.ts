import { Hono } from "hono"
import { listAllassetTag } from "./all-tags"
import { getTagById } from "./get-tag-by-id"
import { getTagByName } from "./get-tag-by-name"

const tagsRoute = new Hono<{ Bindings: Bindings }>()

tagsRoute.get("/all", async (c) => {
    return listAllassetTag(c)
})

tagsRoute.get("/id/:id", async (c) => {
    return getTagById(c)
})

tagsRoute.get("/name/:name", async (c) => {
    return getTagByName(c)
})

export default tagsRoute
