import { Hono } from "hono"
import assetRoute from "./v2/routes/asset/assetRoutes"
import discordRoute from "./v2/routes/discord/discordRoutes"
import ocGeneratorRoute from "./v2/routes/oc-generators/ocGeneratorRoutes"
import gamesRoute from "./v2/routes/games/gamesRoutes"
import authRoute from "./v2/routes/auth/authRoutes"
import searchRoute from "./v2/routes/search/searchRoutes"
import tagsRoute from "./v2/routes/tags/tagsRoutes"
import { getRuntimeKey } from "hono/adapter"

const app = new Hono<{ Bindings: Bindings }>()

app.get("/status", (c) => {
    return c.json(
        {
            status: "ok",
            runtime: getRuntimeKey(),
        },
        200
    )
})
app.get("/", (c) => {
    return c.json({ success: "true", status: "ok", routes: app.routes }, 200)
})
app.route("/v2/asset", assetRoute)
app.route("/v2/discord", discordRoute)
app.route("/v2/oc-generators", ocGeneratorRoute)
app.route("/v2/search", searchRoute)
app.route("/v2/games", gamesRoute)
app.route("/v2/auth", authRoute)
app.route("/v2/tags", tagsRoute)
app.all("*", (c) => {
    return c.json(
        { success: false, status: "error", error: "route doesn't exist" },
        404
    )
})

// https://hono.dev/api/hono#showroutes
app.showRoutes()

export default app
