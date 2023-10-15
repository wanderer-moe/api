import { createTag } from "./createTag"
import { deleteTag } from "./deleteTag"
import { Hono } from "hono"
import { cors } from "hono/cors"

const tagRoute = new Hono<{ Bindings: Bindings }>()

tagRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

tagRoute.post("/create", async (c) => {
    return createTag(c)
})

tagRoute.post("/delete", async (c) => {
    return deleteTag(c)
})

export default tagRoute
