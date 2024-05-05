export const OpenAPIConfig = {
    openapi: "3.1.0",
    info: {
        version: "2.0.0",
        title: "api.wanderer.moe",
        description: `Public Zod OpenAPI documentation for wanderer.moe's API. This API is used to power the website & all routes are documented. Rate limits are imposed to prevent abuse.`,
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

export const CustomCSS: string = `
:root {
    --scalar-font: 'Inter';
  }
  /* basic theme */
  .light-mode {
    --scalar-background-1: #fff;
    --scalar-background-2: #f5f6f8;
    --scalar-background-3: #e7e7e7;
  
    --scalar-color-1: #2a2f45;
    --scalar-color-2: #757575;
    --scalar-color-3: #8e8e8e;
  
    --scalar-color-accent: #EA8FEA;
    --scalar-background-accent: #8ab4f81f;
  
    --scalar-border-color: rgba(215, 215, 206, 0.5);
  }
  .dark-mode {
    --scalar-background-1: #09090B;
    --scalar-background-2: #111113;
    --scalar-background-3: #19191A;
  
    --scalar-color-1:  rgba(255, 255, 255, 0.9);
    --scalar-color-2: rgba(255, 255, 255, 0.62);
    --scalar-color-3:  rgba(255, 255, 255, 0.44);
  
    --scalar-color-accent: #EA8FEA;
    --scalar-background-accent: #8ab4f81f;
  
    --scalar-border-color: rgba(255, 255, 255, 0.12);
  }
  /* Document header */
  .light-mode .t-doc__header,
  .dark-mode .t-doc__header {
    --header-background-1: var(--scalar-background-1);
    --header-border-color: var(--scalar-border-color);
    --header-color-1: var(--scalar-color-1);
    --header-color-2: var(--scalar-color-2);
    --header-call-to-action-color: var(--scalar-color-accent);
  }
  /* Document Sidebar */
  .light-mode .t-doc__sidebar,
  .dark-mode .t-doc__sidebar {
    --scalar-sidebar-background-1: var(--scalar-background-1);
    --scalar-sidebar-color-1: var(--scalar-color-1);
    --scalar-sidebar-color-2: var(--scalar-color-2);
    --scalar-sidebar-border-color: var(--scalar-border-color);
  
    --scalar-sidebar-item-hover-background: var(--scalar-background-3);
    --scalar-sidebar-item-hover-color: currentColor;
  
    --scalar-sidebar-item-active-background: var(--scalar-background-accent);
    --scalar-sidebar-color-active: var(--scalar-color-accent);
  
    --scalar-sidebar-search-background: var(--scalar-background-1);
    --scalar-sidebar-search-color: var(--scalar-color-3);
    --scalar-sidebar-search-border-color: var(--scalar-border-color);
  }
  
  /* advanced */
  .light-mode {
    --scalar-color-green: #C8FFD4;
    --scalar-color-red: #FF8080;
    --scalar-color-yellow: #edbe20;
    --scalar-color-blue: #B8E8FC;
    --scalar-color-orange: #FFCF96;
    --scalar-color-purple: #EA8FEA;
  }
  .dark-mode {
    --scalar-color-green: #C8FFD4;
    --scalar-color-red: #FF8080;
    --scalar-color-yellow: #ffc90d;
    --scalar-color-blue: #B8E8FC;
    --scalar-color-orange: #FFCF96;
    --scalar-color-purple: #EA8FEA;
  }
`
