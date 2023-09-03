import { Hono } from "hono"
import { getAllGames } from "./allGames"
import { Bindings } from "@/worker-configuration"

const gamesRoute = new Hono<{ Bindings: Bindings }>()

gamesRoute.get("/all", async (c) => {
	return getAllGames(c)
})

export default gamesRoute
