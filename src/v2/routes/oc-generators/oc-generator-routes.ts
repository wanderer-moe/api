import { Hono } from "hono"
import { getGeneratorFromName } from "./get-generator"
import { getGenerators } from "./get-generators"

const ocGeneratorRoute = new Hono<{ Bindings: Bindings }>()

ocGeneratorRoute.get("/", async (c) => {
    return getGenerators(c)
})

ocGeneratorRoute.get("/:gameName", async (c) => {
    return getGeneratorFromName(c)
})

export default ocGeneratorRoute
