import { Hono } from "hono"
import { contributors } from "./contributors"
import { Bindings } from "@/worker-configuration"

const discordRoute = new Hono<{ Bindings: Bindings }>()

discordRoute.get("/contributors", async (c) => {
    return contributors(c)
})

export default discordRoute
