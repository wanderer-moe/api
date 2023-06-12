import { rename } from "../helpers/rename";

export const checkTable = async (db, gameId) => {
    const tableName = rename(gameId);
    await db
        .prepare(
            `CREATE TABLE IF NOT EXISTS ${tableName} (location TEXT, requests INTEGER)`
        )
        .run();
};
