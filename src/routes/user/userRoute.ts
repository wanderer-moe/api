import { Hono } from "hono";
import { getUsersBySearch } from "./getUsersBySearch";
import { getUserByUsername } from "./getUserByUsername";

const userRoute = new Hono();

userRoute.get("/u/:name", async (c) => {
    return getUserByUsername(c);
});

userRoute.get("/s/:query", async (c) => {
    return getUsersBySearch(c);
});

export default userRoute;
