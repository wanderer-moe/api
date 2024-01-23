import { OpenAPIHono } from "@hono/zod-openapi"
import { modifyGameRoute } from "./openapi"
import { GameManager } from "@/v2/lib/managers/game/game-manager"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { roleFlagsToArray } from "@/v2/lib/helpers/role-flags"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(modifyGameRoute, async (ctx) => {
    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    if (!user || !roleFlagsToArray(user.roleFlags).includes("DEVELOPER")) {
        return ctx.json(
            {
                success: false,
                message: "Unauthorized",
            },
            401
        )
    }

    const { name, formattedName, possibleSuggestiveContent } =
        ctx.req.valid("json")
    const { id } = ctx.req.valid("param")

    const { drizzle } = getConnection(ctx.env)

    const gameManager = new GameManager(drizzle)

    const gameExists = await gameManager.doesGameExist(id)

    if (!gameExists) {
        return ctx.json(
            {
                success: false,
                message: "Game with ID not found",
            },
            400
        )
    }

    const game = await gameManager.updateGame(
        id,
        name,
        formattedName,
        Boolean(possibleSuggestiveContent)
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
