import { OpenAPIHono } from "@hono/zod-openapi";
import { CreateCollectionRoute } from "./create-collection";
import { DeleteCollectionRoute } from "./delete-collection";

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

CreateCollectionRoute(handler);
DeleteCollectionRoute(handler);

export default handler;