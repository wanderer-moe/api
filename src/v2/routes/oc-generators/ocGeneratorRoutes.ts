import { Hono } from "hono"
import { getGeneratorFromName } from "./getGenerator"
import { getGenerators } from "./getGenerators"
import { Bindings } from "@/worker-configuration"

const ocGeneratorRoute = new Hono<{ Bindings: Bindings }>()

ocGeneratorRoute.get("/", async (c) => {
    return getGenerators(c)
})

ocGeneratorRoute.get("/:gameName", async (c) => {
    return getGeneratorFromName(c)
})

export default ocGeneratorRoute
