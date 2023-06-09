export const checkTable = async (db, gameId) => {
    const tableName = gameId.replace(/-/g, "_");
    await db
        .prepare(
            `CREATE TABLE IF NOT EXISTS ${tableName} (location TEXT, requests INTEGER)`
        )
        .run();
};
