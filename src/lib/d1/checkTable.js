import { rename } from "../helpers/rename";

export const checkTable = async (db, gameId) => {
    await db
        .prepare(
            `CREATE TABLE IF NOT EXISTS ${rename(
                gameId
            )} (location TEXT, requests INTEGER)`
        )
        .run();
};
