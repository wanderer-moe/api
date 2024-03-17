import { OpenAPIHono } from "@hono/zod-openapi"
import { AllCategoriesRoute } from "./all-categories"
import { CreateCategoryRoute } from "./create-category"
import { GetCategoryByIdRoute } from "./get-category"
import { ModifyAssetCategoryRoute } from "./modify-category"
import { DeleteAssetCategoryRoute } from "./delete-category"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

AllCategoriesRoute(handler)
GetCategoryByIdRoute(handler)
CreateCategoryRoute(handler)
ModifyAssetCategoryRoute(handler)
DeleteAssetCategoryRoute(handler)

export default handler
