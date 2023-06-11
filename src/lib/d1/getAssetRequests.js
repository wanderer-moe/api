import { rename } from "../helpers/rename";

export const getAssetRequests = async (db, gameId, asset) => {
    const requests = await db
        .prepare(`SELECT requests FROM ${rename(gameId)} WHERE location = ?`)
        .bind(rename(asset))
        .all();

    if (requests.results?.length === 0) {
        await db
            .prepare(
                `INSERT INTO ${rename(
                    gameId
                )} (location, requests) VALUES (?, 0)`
            )
            .bind(rename(asset))
            .run();
    }

    return requests?.results[0].requests;
};
