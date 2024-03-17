import { OpenAPIHono } from "@hono/zod-openapi"

import SearchAssetRoute from "@/v2/routes/asset/search-assets"
import GetAssetRoute from "@/v2/routes/asset/get-asset"

import UploadAssetRoute from "@/v2/routes/asset/upload-asset"
import ModifyAssetRoute from "@/v2/routes/asset/modify-asset"
import DeleteAssetRoute from "@/v2/routes/asset/delete-asset"

import LikeAssetByIdRoute from "@/v2/routes/asset/like-asset"
import UnlikeAssetByIdRoute from "@/v2/routes/asset/unlike-asset"

import GetAssetLikesRoute from "@/v2/routes/asset/get-asset-likes"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.route("/search", SearchAssetRoute)
handler.route("/get", GetAssetRoute)

handler.route("/upload", UploadAssetRoute)
handler.route("/modify", ModifyAssetRoute)
handler.route("/delete", DeleteAssetRoute)

handler.route("/like", LikeAssetByIdRoute)
handler.route("/unlike", UnlikeAssetByIdRoute)

handler.route("/likes", GetAssetLikesRoute)

export default handler
