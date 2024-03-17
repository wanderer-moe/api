import { OpenAPIHono } from "@hono/zod-openapi"
import { UserCreateAccountRoute } from "./account-create"
import { UserLoginRoute } from "./account-login"
import { UserAllCurrentSessionsRoute } from "./get-all-sessions"
import { LogoutCurrentSessionRoute } from "./logout-current-session"
import { ValidateSessionRoute } from "./validate-current-session"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

UserCreateAccountRoute(handler)
UserLoginRoute(handler)

ValidateSessionRoute(handler)
UserAllCurrentSessionsRoute(handler)
LogoutCurrentSessionRoute(handler)

export default handler
