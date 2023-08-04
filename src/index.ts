import { Hono } from "hono";
import { Env } from "./worker-configuration";
import assetRoute from "./routes/asset/assetRoute";
import discordRoute from "./routes/discord/discordRoute";
import ocGeneratorRoute from "./routes/oc-generators/ocGeneratorRoutes";
import searchRoute from "./routes/search/searchRoute";
import gamesRoute from "./routes/games/gamesRoute";
import userRoute from "./routes/user/userRoute";

interface Bindings extends Env {
    [key: string]: unknown;
}

const app = new Hono<{ Bindings: Bindings }>();

app.get("/status", (c) => {
    c.status(200);
    return c.json({ status: "ok" });
});
app.get("/", (c) => {
    c.status(200);
    return c.json({ success: "true", status: "ok", routes: app.routes });
});
app.route("/asset", assetRoute);
app.route("/discord", discordRoute);
app.route("/oc-generators", ocGeneratorRoute);
app.route("/search", searchRoute);
app.route("/games", gamesRoute);
app.route("/user", userRoute);
app.all("*", (c) => {
    c.status(404);
    return c.json({ status: "not found" });
});

// https://hono.dev/api/hono#showroutes
app.showRoutes();

export default app;
