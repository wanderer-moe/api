import { Hono } from "hono"
import { login } from "./login"
import { logout } from "./logout"
import { signup } from "./signup"
import { cors } from "hono/cors"
import { validate } from "./validate"
import { uploadProfileImage } from "./uploadAvatar"
import { uploadBannerImage } from "./uploadBanner"
import { updateUserAttributes } from "./updateUserAttributes"
import { uploadAsset } from "./uploadAsset"

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

authRoute.post("/update/attributes", async (c) => {
    return updateUserAttributes(c)
})

authRoute.post("/upload/asset", async (c) => {
    return uploadAsset(c)
})

authRoute.post("/upload/avatar", async (c) => {
    return uploadProfileImage(c)
})

authRoute.post("/upload/banner", async (c) => {
    return uploadBannerImage(c)
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
