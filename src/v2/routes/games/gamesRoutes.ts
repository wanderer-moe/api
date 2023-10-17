import { Hono } from "hono"
import { getAllGames } from "./allGames"

const gameRoute = new Hono<{ Bindings: Bindings }>()

gameRoute.get("/all", async (c) => {
    return getAllGames(c)
})

export default gameRoute
