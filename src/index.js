// src/index.js

import { router } from "./handler.js";

export default {
    fetch: router.handle,
};
