import { OpenAPIHono } from "@hono/zod-openapi"

import GetUserRoute from "./get-user"
import SearchUserRoute from "./search-users"

import FollowUserRoute from "./follow-user"
import UnfollowUserRoute from "./unfollow-user"

import UserFollowingRoute from "./user-following"
import UserFollowersRoute from "./user-followers"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/get", GetUserRoute)
handler.route("/search", SearchUserRoute)
handler.route("/follow", FollowUserRoute)
handler.route("/unfollow", UnfollowUserRoute)
handler.route("/following", UserFollowingRoute)
handler.route("/followers", UserFollowersRoute)

export default handler
