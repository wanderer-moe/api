// src/index.mjs

import { router } from "./routes.mjs";

export default {
    fetch: router.handle,
};
