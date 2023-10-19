import { Hono } from "hono"
import { getAllGames } from "./all-games"

const gameRoute = new Hono<{ Bindings: Bindings }>()

gameRoute.get("/all", async (c) => {
    return getAllGames(c)
})

export default gameRoute
