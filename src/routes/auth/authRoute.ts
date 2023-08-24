import { Hono } from "hono"
import { login } from "./login"
import { logout } from "./logout"
import { signup } from "./signup"
import { cors } from "hono/cors"
import { validate } from "./validate"
import { updateUserAttributes } from "./updateUserAttributes"

const authRoute = new Hono()

authRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["https://next.wanderer.moe", "http://localhost:3000"],
    })
)

authRoute.post("/login", async (c) => {
    return login(c)
})

authRoute.post("/updateattributes", async (c) => {
    return updateUserAttributes(c)
})

authRoute.post("/signup", async (c) => {
    return signup(c)
})

authRoute.get("/validate", async (c) => {
    return validate(c)
})

authRoute.post("/logout", async (c) => {
    return logout(c)
})

export default authRoute
