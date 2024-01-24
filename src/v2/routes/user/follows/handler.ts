import { OpenAPIHono } from "@hono/zod-openapi"
import UserFollowRoute from "@/v2/routes/user/follows/follow/id/[id]/route"
import UserUnfollowRoute from "@/v2/routes/user/follows/unfollow/id/[id]/route"

import GetUsersFollowingRoute from "@/v2/routes/user/follows/following/id/[id]/route"
import GetUsersFollowersRoute from "@/v2/routes/user/follows/followers/id/[id]/route"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/follow/id", UserFollowRoute)
handler.route("/unfollow/id", UserUnfollowRoute)

handler.route("/following/id", GetUsersFollowingRoute)
handler.route("/followers/id", GetUsersFollowersRoute)

export default handler
