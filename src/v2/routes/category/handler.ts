import { OpenAPIHono } from "@hono/zod-openapi"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()


export default handler
