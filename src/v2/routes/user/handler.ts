import { OpenAPIHono } from "@hono/zod-openapi"

import { GetUserByIdRoute } from "./get-user"
import { SearchUsersByUsernameRoute } from "./search-users"

import { ViewUsersFollowersRoute } from "./user-followers"
import { ViewUsersFollowingRoute } from "./user-following"

import { FollowUserRoute } from "./follow-user"
import { UnfollowUserRoute } from "./unfollow-user"

import { BlockUserRoute } from "./block-user"
import { UnblockUserRoute } from "./unblock-user"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

GetUserByIdRoute(handler)
SearchUsersByUsernameRoute(handler)

ViewUsersFollowersRoute(handler)
ViewUsersFollowingRoute(handler)

FollowUserRoute(handler)
UnfollowUserRoute(handler)

BlockUserRoute(handler)
UnblockUserRoute(handler)

export default handler
