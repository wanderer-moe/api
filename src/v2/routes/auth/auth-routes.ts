import { Hono } from "hono"
import { login } from "./login"
import { logout } from "./logout"
import { signup } from "./signup"
import { cors } from "hono/cors"
import { validate } from "./validate"
import { verifyEmail } from "./verify-email"
import { resetPassword, generatePasswordResetToken } from "./reset-password"
import assetCategoryRoute from "./asset-categories/asset-category-routes"
import assetRoute from "./assets/asset-routes"
import ocGeneratorRoute from "./oc-generators/oc-generator-routes"
import gameRoute from "./games/game-routes"
import tagRoute from "./tags/tag-routes"
import userAttributesRoute from "./user-attributes/user-attributes-routes"

const authRoute = new Hono<{ Bindings: Bindings }>()

authRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

authRoute.post("/login", async (c) => {
    return login(c)
})

authRoute.get("/verify-email/:token", async (c) => {
    return verifyEmail(c)
})

authRoute.get("/validate", async (c) => {
    return validate(c)
})

authRoute.post("/logout", async (c) => {
    return logout(c)
})

authRoute.post("/signup", async (c) => {
    return signup(c)
})

authRoute.post("/reset-password", async (c) => {
    return resetPassword(c)
})

authRoute.post("/generate-password-reset-token", async (c) => {
    return generatePasswordResetToken(c)
})

authRoute.route("/assets", assetRoute)
authRoute.route("/asset-categories", assetCategoryRoute)
authRoute.route("/oc-generators", ocGeneratorRoute)
authRoute.route("/game", gameRoute)
authRoute.route("/tags", tagRoute)
authRoute.route("/user-attributes", userAttributesRoute)

export default authRoute
