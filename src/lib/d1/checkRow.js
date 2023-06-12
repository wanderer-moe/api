import { rename } from "../helpers/rename";

export const checkRow = async (db, gameId, asset) => {
    const tableName = rename(gameId);
    const location = rename(asset);

    const row = await db
        .prepare(`SELECT requests FROM ${tableName} WHERE location = ?`)
        .bind(location)
        .all();

    if (!row) {
        await db
            .prepare(
                `INSERT INTO ${tableName} (location, requests) VALUES (?, 0)`
            )
            .bind(location)
            .run();
    }

    await db
        .prepare(
            `UPDATE ${tableName} SET requests = requests + 1 WHERE location = ?`
        )
        .bind(location)
        .run();
};
