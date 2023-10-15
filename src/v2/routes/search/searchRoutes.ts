import { Hono } from "hono"
import { searchAll } from "./all/searchAll"
import { getUserByUsername } from "./user/getUserByUsername"
import { getUsersBySearch } from "./user/getUsersBySearch"
import authRoute from "../auth/authRoutes"
import { searchForAssets } from "./asset/searchAssets"
import { recentAssets } from "./asset/recentAssets"
import { cors } from "hono/cors"

const searchRoute = new Hono<{ Bindings: Bindings }>()

searchRoute.get("/all/:query", async (c) => {
    return searchAll(c)
})

authRoute.use(
    "/all/:query",
    cors({
        credentials: true,
        origin: ["*"], // TODO: update this - temporary
    })
)

authRoute.use(
    "/users/user/:username",
    cors({
        credentials: true,
        origin: ["*"], // TODO: update this - temporary
    })
)

searchRoute.get("/assets/query", async (c) => {
    return searchForAssets(c)
})

searchRoute.get("/assets/recent", async (c) => {
    return recentAssets(c)
})

searchRoute.get("/users/user/:username", async (c) => {
    return getUserByUsername(c)
})

searchRoute.get("/users/query/:query", async (c) => {
    return getUsersBySearch(c)
})

export default searchRoute