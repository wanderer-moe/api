import { createGame } from "./create-game"
import { deleteGame } from "./delete-game"
import { Hono } from "hono"
import { cors } from "hono/cors"

const gameRoute = new Hono<{ Bindings: Bindings }>()

gameRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

gameRoute.post("/create", async (c) => {
    return createGame(c)
})

gameRoute.post("/delete", async (c) => {
    return deleteGame(c)
})

export default gameRoute
