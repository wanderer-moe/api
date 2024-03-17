import { OpenAPIHono } from "@hono/zod-openapi"

import { GetAssetByIdRoute } from "./get-asset"
import { LikeAssetByIdRoute } from "./like-asset"
import { UnlikeAssetByIdRoute } from "./unlike-asset"
import { AssetSearchAllFilterRoute } from "./search-assets"
import { GetAssetLikesRoute } from "./get-asset-likes"
import { ModifyAssetRoute } from "./modify-asset"
import { UploadAssetRoute } from "./upload-asset"
import { DeleteAssetByIdRoute } from "./delete-asset"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

AssetSearchAllFilterRoute(handler)
UploadAssetRoute(handler)

GetAssetByIdRoute(handler)
ModifyAssetRoute(handler)
DeleteAssetByIdRoute(handler)

UnlikeAssetByIdRoute(handler)
LikeAssetByIdRoute(handler)

GetAssetLikesRoute(handler)

export default handler
