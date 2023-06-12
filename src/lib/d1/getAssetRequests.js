import { rename } from "../helpers/rename";

export const getAssetRequests = async (db, gameId, asset) => {
    const tableName = rename(gameId);
    const location = rename(asset);

    const requests = await db
        .prepare(`SELECT requests FROM ${tableName} WHERE location = ?`)
        .bind(location)
        .all();

    if (requests.results?.length === 0) {
        await db
            .prepare(
                `INSERT INTO ${tableName} (location, requests) VALUES (?, 0)`
            )
            .bind(location)
            .run();
    }

    return requests?.results[0].requests;
};
