import { Hono } from "hono"
import { getUsersBySearch } from "./getUsersBySearch"
import { getUserByUsername } from "./getUserByUsername"
import { Bindings } from "@/worker-configuration"

const userRoute = new Hono<{ Bindings: Bindings }>()

userRoute.get("/u/:username", async (c) => {
    return getUserByUsername(c)
})

userRoute.get("/s/:query", async (c) => {
    return getUsersBySearch(c)
})

export default userRoute
