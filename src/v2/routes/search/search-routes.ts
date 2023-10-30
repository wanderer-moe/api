import { Hono } from "hono"
import { searchAll } from "./all/search-all"
import { getUserByUsername } from "./user/get-user-by-username"
import { getUsersBySearch } from "./user/get-users-by-search"
import authRoute from "../auth/auth-routes"
import { searchForAssets } from "./asset/search-assets"
import { recentAssets } from "./asset/recent-assets"
import { cors } from "hono/cors"

const searchRoute = new Hono<{ Bindings: Bindings }>()

searchRoute.get("/all/:query", async (c) => {
    return searchAll(c)
})

authRoute.use(
    "/all/:query",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

authRoute.use(
    "/users/user/:username",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
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
