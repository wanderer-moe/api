import { Hono } from "hono"
import { contributors } from "./contributors"

const discordRoute = new Hono()

discordRoute.get("/contributors", async (c) => {
    return contributors(c)
})

export default discordRoute
