import { Hono } from "hono"
import { getGeneratorFromName } from "./getGenerator"
import { getGenerators } from "./getGenerators"

const ocGeneratorRoute = new Hono()

ocGeneratorRoute.get("/", async (c) => {
    return getGenerators(c)
})

ocGeneratorRoute.get("/:gameName", async (c) => {
    return getGeneratorFromName(c)
})

export default ocGeneratorRoute
