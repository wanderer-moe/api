import { OpenAPIHono } from "@hono/zod-openapi"
import { CreateCollectionRoute } from "./create-collection"
import { DeleteCollectionRoute } from "./delete-collection"
import { GetCollectionByIdRoute } from "./get-collection"
import { ModifyCollectionRoute } from "./modify-collection"
import { GetCollectionAssetsByIdRoute } from "./get-collection-assets"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

GetCollectionByIdRoute(handler)
GetCollectionAssetsByIdRoute(handler)
ModifyCollectionRoute(handler)
CreateCollectionRoute(handler)
DeleteCollectionRoute(handler)

export default handler
