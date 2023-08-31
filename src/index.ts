import { Hono } from "hono"
import assetRoute from "./v2/routes/asset/assetRoute"
import discordRoute from "./v2/routes/discord/discordRoute"
import ocGeneratorRoute from "./v2/routes/oc-generators/ocGeneratorRoutes"
// import assetSearchRoute from "./routes/search/asset/searchRoute";
import gamesRoute from "./v2/routes/games/gamesRoute"
import userRoute from "./v2/routes/user/userRoute"
import authRoute from "./v2/routes/auth/authRoute"
import { getRuntimeKey } from "hono/adapter"
import { Bindings } from "@/worker-configuration"

const app = new Hono<{ Bindings: Bindings }>()

app.get("/status", (c) => {
    c.status(200)
    return c.json({
        status: "ok",
        runtime: getRuntimeKey(),
    })
})
app.get("/", (c) => {
    c.status(200)
    return c.json({ success: "true", status: "ok", routes: app.routes })
})
app.route("/v2/asset", assetRoute)
app.route("/v2/discord", discordRoute)
app.route("/v2/oc-generators", ocGeneratorRoute)
// app.route("/search/assets", assetSearchRoute);
app.route("/v2/games", gamesRoute)
app.route("/v2/user", userRoute)
app.route("/v2/auth", authRoute)
app.all("*", (c) => {
    c.status(404)
    return c.json({ status: "not found" })
})

// https://hono.dev/api/hono#showroutes
app.showRoutes()

export default app
