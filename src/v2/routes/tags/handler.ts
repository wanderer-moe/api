import { OpenAPIHono } from "@hono/zod-openapi"
import { AllTagsRoute } from "./all-tags"
import { CreateTagRoute } from "./create-tag"
import { GetTagByIdRoute } from "./get-tag"
import { DeleteTagRoute } from "./delete-tag"
import { ModifyTagRoute } from "./modify-tag"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

AllTagsRoute(handler)
GetTagByIdRoute(handler)
CreateTagRoute(handler)
ModifyTagRoute(handler)
DeleteTagRoute(handler)

export default handler
