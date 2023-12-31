import { OpenAPIHono } from "@hono/zod-openapi"
import { apiReference } from "@scalar/hono-api-reference"
import { prettyJSON } from "hono/pretty-json"
import BaseRoutes from "@/v2/routes/handler"
import { OpenAPIConfig } from "./openapi/config"
import { cors } from "hono/cors"

import { csrfValidation } from "./v2/middleware/csrf"
import { LogTime } from "./v2/middleware/time-taken"

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

app.route("/v2", BaseRoutes)

app.use(
    "*",
    cors({
        // todo(dromzeh): THIS IS TEMPORARY BTW PLEASE SET THIS DEPENDENT ON ENV
        origin: "*",
        credentials: true,
    })
)

app.get(
    "/",
    apiReference({
        spec: {
            url: "/openapi",
        },
        // i should clean this up at some point icl
        customCss: `
        :root {
            --theme-font: 'Inter', var(--system-fonts);
        }
        /* basic theme */
        .light-mode {
        --theme-color-1: #2a2f45;
        --theme-color-2: #757575;
        --theme-color-3: #8e8e8e;
        --theme-color-accent: #EA8FEA;

        --theme-background-1: #fff;
        --theme-background-2: #f6f6f6;
        --theme-background-3: #e7e7e7;
        --theme-background-accent: #8ab4f81f;

        --theme-border-color: rgba(0, 0, 0, 0.1);
        }
        .dark-mode {
        --theme-color-1: rgba(255, 255, 255, 0.9);
        --theme-color-2: rgba(255, 255, 255, 0.62);
        --theme-color-3: rgba(255, 255, 255, 0.44);
        --theme-color-accent: #EA8FEA;

        --theme-background-1: #09090B;
        --theme-background-2: #111113;
        --theme-background-3: #19191A;
        --theme-background-accent: #8ab4f81f;

        --theme-border-color: rgba(255, 255, 255, 0.1);
        }
        /* Document header */
        .light-mode .t-doc__header {
            --header-background-1: var(--theme-background-1);
            --header-border-color: var(--theme-border-color);
            --header-color-1: var(--theme-color-1);
            --header-color-2: var(--theme-color-2);
            --header-background-toggle: var(--theme-color-3);
            --header-call-to-action-color: var(--theme-color-accent);
        }

        .dark-mode .t-doc__header {
            --header-background-1: var(--theme-background-1);
            --header-border-color: var(--theme-border-color);
            --header-color-1: var(--theme-color-1);
            --header-color-2: var(--theme-color-2);
            --header-background-toggle: var(--theme-color-3);
            --header-call-to-action-color: var(--theme-color-accent);
        }
        /* Document Sidebar */
        .light-mode .t-doc__sidebar {
            --sidebar-background-1: var(--theme-background-1);
            --sidebar-item-hover-color: currentColor;
            --sidebar-item-hover-background: var(--theme-background-2);
            --sidebar-item-active-background: var(--theme-background-accent);
            --sidebar-border-color: var(--theme-border-color);
            --sidebar-color-1: var(--theme-color-1);
            --sidebar-color-2: var(--theme-color-2);
            --sidebar-color-active: var(--theme-color-accent);
            --sidebar-search-background: transparent;
            --sidebar-search-border-color: var(--theme-border-color);
            --sidebar-search--color: var(--theme-color-3);
        }

        .dark-mode .sidebar {
            --sidebar-background-1: var(--theme-background-1);
            --sidebar-item-hover-color: currentColor;
            --sidebar-item-hover-background: var(--theme-background-2);
            --sidebar-item-active-background: var(--theme-background-accent);
            --sidebar-border-color: var(--theme-border-color);
            --sidebar-color-1: var(--theme-color-1);
            --sidebar-color-2: var(--theme-color-2);
            --sidebar-color-active: var(--theme-color-accent);
            --sidebar-search-background: transparent;
            --sidebar-search-border-color: var(--theme-border-color);
            --sidebar-search--color: var(--theme-color-3);
        }

        .sidebar-heading-link {
            font-weight: 600;
        }

        .item-entry-description {
            color: rgba(255, 255, 255, 0.44) !important;
        }

        /* advanced */
        .light-mode {
        --theme-button-1: rgb(49 53 56);
        --theme-button-1-color: #fff;
        --theme-button-1-hover: rgb(28 31 33);

        --theme-color-green: #C8FFD4;
        --theme-color-red: #FF8080;
        --theme-color-yellow: #edbe20;
        --theme-color-blue: #B8E8FC;
        --theme-color-orange: #FFCF96;
        --theme-color-purple: #EA8FEA;

        --theme-scrollbar-color: rgba(0, 0, 0, 0.18);
        --theme-scrollbar-color-active: rgba(0, 0, 0, 0.36);
        }
        .dark-mode {
        --theme-button-1: #f6f6f6;
        --theme-button-1-color: #000;
        --theme-button-1-hover: #e7e7e7;

        --theme-color-green: #C8FFD4;
        --theme-color-red: #FF8080;
        --theme-color-yellow: #ffc90d;
        --theme-color-blue: #B8E8FC;
        --theme-color-orange: #FFCF96;
        --theme-color-purple: #EA8FEA;

        --theme-scrollbar-color: rgba(255, 255, 255, 0.24);
        --theme-scrollbar-color-active: rgba(255, 255, 255, 0.48);
        }
        :root {
        --theme-radius: 3px;
        --theme-radius-lg: 6px;
        --theme-radius-xl: 8px;

        --theme-header-height: 50px;
        }`,
    })
)

app.use("*", csrfValidation)
app.use("*", LogTime)

app.use("*", prettyJSON())

app.doc("/openapi", OpenAPIConfig)

app.onError((err, ctx) => {
    console.error(err)
    // TODO: error logging
    return ctx.json(
        {
            success: false,
            message: "Internal Server Error",
        },
        500
    )
})

export default app
