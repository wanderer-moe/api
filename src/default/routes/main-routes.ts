import { Hono } from "hono"
import { getRuntimeKey } from "hono/adapter"

const mainRoute = new Hono<{ Bindings: Bindings }>()

mainRoute.get("/status", (c) => {
    return c.json(
        {
            success: "true",
            status: "ok",
            runtime: getRuntimeKey(),
        },
        200
    )
})

mainRoute.get("/", (c) => {
    return c.json({ success: "true", status: "ok" }, 200)
})

export default mainRoute
