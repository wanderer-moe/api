import { OpenAPIHono } from "@hono/zod-openapi"
import { AllRequestsRoute } from "./all-requests"
import { DeleteRequestByIdRoute } from "./delete-request"
import { CreateRequestFormEntryRoute } from "./create-request"
import { UpvoteRequestRoute } from "./upvote-request"
import { ViewRequestRoute } from "./view-request"
import { RemoveRequestUpvoteRoute } from "./remove-request-upvote"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

AllRequestsRoute(handler)
ViewRequestRoute(handler)

UpvoteRequestRoute(handler)
RemoveRequestUpvoteRoute(handler)

CreateRequestFormEntryRoute(handler)
DeleteRequestByIdRoute(handler)

export default handler
