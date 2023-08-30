import { Hono } from "hono"
import assetRoute from "./routes/asset/assetRoute"
import discordRoute from "./routes/discord/discordRoute"
import ocGeneratorRoute from "./routes/oc-generators/ocGeneratorRoutes"
// import assetSearchRoute from "./routes/search/asset/searchRoute";
import gamesRoute from "./routes/games/gamesRoute"
import userRoute from "./routes/user/userRoute"
import authRoute from "./routes/auth/authRoute"
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
