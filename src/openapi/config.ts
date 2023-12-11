import { OpenAPIObjectConfig } from "@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator"

export const OpenAPIConfig: OpenAPIObjectConfig = {
    openapi: "3.1.0",
    info: {
        version: "2.0.0",
        title: "api.wanderer.moe",
        description: "Public Zod OpenAPI documentation for wanderer.moe's API.",
        license: {
            name: "GNU General Public License v3.0",
            url: "https://www.gnu.org/licenses/gpl-3.0.en.html",
        },
        contact: {
            url: "https://wanderer.moe",
            name: "wanderer.moe",
        },
    },
}
