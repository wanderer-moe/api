import { Hono } from "hono"
import { Env } from "./worker-configuration"
import assetRoute from "./routes/asset/assetRoute"
import discordRoute from "./routes/discord/discordRoute"
import ocGeneratorRoute from "./routes/oc-generators/ocGeneratorRoutes"
// import assetSearchRoute from "./routes/search/asset/searchRoute";
import gamesRoute from "./routes/games/gamesRoute"
import userRoute from "./routes/user/userRoute"
import authRoute from "./routes/auth/authRoute"
interface Bindings extends Env {
    [key: string]: unknown
}

const app = new Hono<{ Bindings: Bindings; Env: Env }>()

app.get("/status", (c) => {
    c.status(200)
    return c.json({ status: "ok" })
})
app.get("/", (c) => {
    c.status(200)
    return c.json({ success: "true", status: "ok", routes: app.routes })
})
app.route("/asset", assetRoute)
app.route("/discord", discordRoute)
app.route("/oc-generators", ocGeneratorRoute)
// app.route("/search/assets", assetSearchRoute);
app.route("/games", gamesRoute)
app.route("/user", userRoute)
app.route("/auth", authRoute)
app.all("*", (c) => {
    c.status(404)
    return c.json({ status: "not found" })
})

// https://hono.dev/api/hono#showroutes
app.showRoutes()

export default app
