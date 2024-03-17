import { OpenAPIHono } from "@hono/zod-openapi"

import { GetAssetByIdRoute } from "./get-asset"
import { LikeAssetByIdRoute } from "./like-asset"
import { UnlikeAssetByIdRoute } from "./unlike-asset"
import { AssetSearchAllFilterRoute } from "./search-assets"
import { GetAssetLikesRoute } from "./get-users-asset-likes"
import { ModifyAssetRoute } from "./modify-asset"
import { UploadAssetRoute } from "./upload-asset"
import { DeleteAssetByIdRoute } from "./delete-asset"
import { DownloadAssetRoute } from "./download-asset"
import { GetCommentsRepliesRoute } from "./get-comment-replies"

import { ViewAssetCommentsRoute } from "./get-asset-comments"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

AssetSearchAllFilterRoute(handler)
UploadAssetRoute(handler)

GetAssetByIdRoute(handler)
DownloadAssetRoute(handler)
ModifyAssetRoute(handler)
DeleteAssetByIdRoute(handler)

LikeAssetByIdRoute(handler)
UnlikeAssetByIdRoute(handler)

GetAssetLikesRoute(handler)

ViewAssetCommentsRoute(handler)
GetCommentsRepliesRoute(handler)

export default handler
