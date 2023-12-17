import { OpenAPIHono } from "@hono/zod-openapi"
import { createGameRoute } from "./openapi"
import { GameManager } from "@/v2/lib/managers/game/game-manager"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { roleFlagsToArray } from "@/v2/lib/helpers/role-flags"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(createGameRoute, async (ctx) => {
    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    if (!user || !roleFlagsToArray(user.roleFlags).includes("DEVELOPER")) {
        return ctx.json(
            {
                success: false,
                error: "Unauthorized",
            },
            401
        )
    }

    const { name, formattedName, possibleSuggestiveContent } =
        ctx.req.valid("json")

    if (
        possibleSuggestiveContent !== "1" &&
        possibleSuggestiveContent !== "0"
    ) {
        return ctx.json(
            {
                success: false,
                error: "Invalid suggestive content value, must be 0 or 1",
            },
            400
        )
    }

    const { drizzle } = getConnection(ctx.env)

    const gameManager = new GameManager(drizzle)

    const gameExists = await gameManager.doesGameExist(name)

    if (gameExists) {
        return ctx.json(
            {
                success: false,
                error: "Game already exists",
            },
            400
        )
    }

    const game = await gameManager.createGame(
        name,
        formattedName,
        parseInt(possibleSuggestiveContent)
    )

    return ctx.json(
        {
            success: true,
            game,
        },
        200
    )
})

export default handler
