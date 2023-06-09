// todo: rewrite

export const checkRow = async (db, gameId, asset) => {
    const assetName = asset.replace(/-/g, "_");
    const tableName = gameId.replace(/-/g, "_");

    const row = await db
        .prepare(`SELECT requests FROM ${tableName} WHERE location = ?`)
        .bind(assetName)
        .all();

    if (row.results?.length === 0) {
        await db
            .prepare(
                `INSERT INTO ${tableName} (location, requests) VALUES (?, 0)`
            )
            .bind(assetName)
            .run();
    }

    await db
        .prepare(
            `UPDATE ${tableName} SET requests = requests + 1 WHERE location = ?`
        )
        .bind(assetName)
        .run();
};
