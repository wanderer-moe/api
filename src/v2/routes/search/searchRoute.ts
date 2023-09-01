import { Hono } from "hono"
import { searchAll } from "./all/searchAll"
import { Bindings } from "@/worker-configuration"
import { getUserByUsername } from "./user/getUserByUsername"
import { getUsersBySearch } from "./user/getUsersBySearch"
import authRoute from "../auth/authRoute"
import { cors } from "hono/cors"

const searchRoute = new Hono<{ Bindings: Bindings }>()

searchRoute.get("/all", async (c) => {
    return searchAll(c)
})

authRoute.use(
    "/all",
    cors({
        credentials: true,
        origin: ["https://next.wanderer.moe"],
    })
)

searchRoute.get("/users/user/:username", async (c) => {
    return getUserByUsername(c)
})

searchRoute.get("/users/query/:query", async (c) => {
    return getUsersBySearch(c)
})

export default searchRoute
