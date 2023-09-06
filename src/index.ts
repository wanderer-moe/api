import { Hono } from "hono"
import assetRoute from "./v2/routes/asset/assetRoute"
import discordRoute from "./v2/routes/discord/discordRoute"
import ocGeneratorRoute from "./v2/routes/oc-generators/ocGeneratorRoutes"
import gamesRoute from "./v2/routes/games/gamesRoute"
import authRoute from "./v2/routes/auth/authRoute"
import searchRoute from "./v2/routes/search/searchRoute"
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
app.route("/v2/search", searchRoute)
app.route("/v2/games", gamesRoute)
app.route("/v2/auth", authRoute)
app.all("*", (c) => {
	c.status(404)
	return c.json({ success: false, status: "error", error: "Not Found" })
})

// https://hono.dev/api/hono#showroutes
app.showRoutes()

export default app
