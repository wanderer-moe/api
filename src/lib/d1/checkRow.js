import { rename } from "../helpers/rename";

export const checkRow = async (db, gameId, asset) => {
    const row = await db
        .prepare(`SELECT requests FROM ${rename(gameId)} WHERE location = ?`)
        .bind(rename(asset))
        .all();

    if (row.results?.length === 0) {
        await db
            .prepare(
                `INSERT INTO ${rename(
                    gameId
                )} (location, requests) VALUES (?, 0)`
            )
            .bind(rename(asset))
            .run();
    }

    await db
        .prepare(
            `UPDATE ${rename(
                gameId
            )} SET requests = requests + 1 WHERE location = ?`
        )
        .bind(rename(asset))
        .run();
};
