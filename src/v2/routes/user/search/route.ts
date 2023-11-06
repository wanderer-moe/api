import { OpenAPIHono } from "@hono/zod-openapi";
import SearchUserByIdRoute from "@/v2/routes/user/search/[id]/route";
import SearchUserByNameRoute from "@/v2/routes/user/search/[name]/route";

const handler = new OpenAPIHono<{ Bindings: Bindings, Variables: Variables }>()

handler.route("", SearchUserByIdRoute)
handler.route("", SearchUserByNameRoute)

export default handler