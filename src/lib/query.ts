import type { Asset } from "@/lib/types/asset";
import { getConnection } from "@/lib/planetscale";

type queryParameter = string | number;

export const getSearchResults = async (
    query: string,
    gameArray: string[],
    assetArray: string[],
    tagsArray: string[],
    c
): Promise<Asset[]> => {
    let sqlQuery = `SELECT * FROM assets WHERE 1=1`;
    const parameters = [];

    sqlQuery = addQueryToSqlQuery(query, sqlQuery, parameters);
    sqlQuery = addGameToSqlQuery(gameArray, sqlQuery, parameters);
    sqlQuery = addAssetToSqlQuery(assetArray, sqlQuery, parameters);
    sqlQuery = addTagsToSqlQuery(tagsArray, sqlQuery, parameters);

    sqlQuery += ` ORDER BY uploaded_date DESC`;

    sqlQuery = limitResults(sqlQuery);

    if (
        !query &&
        !gameArray.length &&
        !assetArray.length &&
        !tagsArray.length
    ) {
        sqlQuery = `SELECT * FROM assets ORDER BY uploaded_date DESC LIMIT 30`;
    }

    const conn = await getConnection(c.env);
    const db = conn.planetscale;

    return await db
        .execute(sqlQuery, parameters)
        .then((row) => row.rows as Asset[]);
};

const addQueryToSqlQuery = (
    query: string,
    sqlQuery: string,
    parameters: queryParameter[]
): string => {
    if (query) {
        sqlQuery += ` AND name LIKE ?`;
        parameters.push(`%${query}%`);
    }
    return sqlQuery;
};

const addGameToSqlQuery = (
    gameArray: string[],
    sqlQuery: string,
    parameters: queryParameter[]
): string => {
    if (gameArray.length) {
        sqlQuery += ` AND game IN (${gameArray.map(() => "?").join(",")})`;
        parameters.push(...gameArray);
    }
    return sqlQuery;
};

const addAssetToSqlQuery = (
    assetArray: string[],
    sqlQuery: string,
    parameters: queryParameter[]
): string => {
    if (assetArray.length) {
        sqlQuery += ` AND asset_category IN (${assetArray
            .map(() => "?")
            .join(",")})`;
        parameters.push(...assetArray);
    }
    return sqlQuery;
};

const addTagsToSqlQuery = (
    tagsArray: string[],
    sqlQuery: string,
    parameters: queryParameter[]
): string => {
    if (tagsArray.length) {
        sqlQuery += ` AND tags IN (${tagsArray
            .map(() => "?")
            .join(",")
            .toUpperCase()})`;
        parameters.push(...tagsArray);
    }
    return sqlQuery;
};

const limitResults = (sqlQuery: string): string => {
    return (sqlQuery += ` LIMIT 1500`);
};
