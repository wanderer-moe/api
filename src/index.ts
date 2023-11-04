import { Hono } from "hono"
import assetRoute from "./v2/routes/asset/asset-routes"
import discordRoute from "./v2/routes/discord/discord-routes"
import ocGeneratorRoute from "./v2/routes/oc-generators/oc-generator-routes"
import gamesRoute from "./v2/routes/games/games-routes"
import authRoute from "./v2/routes/auth/auth-routes"
import searchRoute from "./v2/routes/search/search-routes"
import tagsRoute from "./v2/routes/tags/tags-routes"
import mainRoute from "./default/routes/main-routes"

const app = new Hono<{ Bindings: Bindings }>()

app.route("/", mainRoute)
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
