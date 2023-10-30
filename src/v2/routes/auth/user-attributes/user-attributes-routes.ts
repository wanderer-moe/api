import { updateUserAttributes } from "./update-user-attributes"
import { uploadProfileImage } from "./self-upload/upload-avatar"
import { uploadBannerImage } from "./self-upload/upload-banner"
import { followUser } from "./user-relations/follow-user"
import { unfollowUser } from "./user-relations/unfollow-user"
import { Hono } from "hono"
import { cors } from "hono/cors"

const userAttributesRoute = new Hono<{ Bindings: Bindings }>()

userAttributesRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["http://localhost:3000"], // TODO: update this - temporary
    })
)

userAttributesRoute.post("/update", async (c) => {
    return updateUserAttributes(c)
})

userAttributesRoute.post("/upload/avatar", async (c) => {
    return uploadProfileImage(c)
})

userAttributesRoute.post("/upload/banner", async (c) => {
    return uploadBannerImage(c)
})

userAttributesRoute.post("/follow", async (c) => {
    return followUser(c)
})

userAttributesRoute.post("/unfollow", async (c) => {
    return unfollowUser(c)
})

export default userAttributesRoute
