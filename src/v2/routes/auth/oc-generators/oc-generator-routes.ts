import { saveOCGeneratorResponse } from "./save-oc-generator-response"
import { deleteOCGeneratorResponse } from "./delete-oc-generator-response"
import { viewOCGeneratorResponses } from "./view-oc-generator-response"
import { Hono } from "hono"
import { cors } from "hono/cors"

const ocGeneratorRoute = new Hono<{ Bindings: Bindings }>()

ocGeneratorRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

ocGeneratorRoute.post("/save", async (c) => {
    return saveOCGeneratorResponse(c)
})

ocGeneratorRoute.post("/delete", async (c) => {
    return deleteOCGeneratorResponse(c)
})

ocGeneratorRoute.get("/all", async (c) => {
    return viewOCGeneratorResponses(c)
})

export default ocGeneratorRoute