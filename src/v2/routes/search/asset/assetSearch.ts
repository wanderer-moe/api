// import { responseHeaders } from "@/v2/lib/responseHeaders"
// import type { Asset } from "@/v2/lib/types/asset"
// import { getSearchResults } from "@/v2/lib/query"
// import { getConnection } from "@/v2/db/turso"
// import type { APIContext as Context } from "@/worker-configuration"

// export async function getAssetSearch(c: Context): Promise<Response> {
//     const queryParams = c.req.query()
//     // console.log(queryParams);
//     const { query, game, asset, tags } = queryParams

//     // Convert game and asset parameters to arrays
//     const gameArray = game ? game.split(",") : []
//     const assetArray = asset ? asset.split(",") : []
//     const tagsArray = tags ? tags.split(",") : []

//     const cacheKey = new Request(c.req.url.toString(), c.req)
//     const cache = caches.default
//     let response = await cache.match(cacheKey)

//     if (response) return response

//     // console.log(query, gameArray, assetArray, tags);

//     const results = (
//         await getSearchResults(query, gameArray, assetArray, tagsArray, c)
//     ).map((results) => {
//         return {
//             id: results.id,
//             name: results.name,
//             game: results.game,
//             asset_category: results.asset_category,
//             url: results.url,
//             tags: results.tags,
//             status: results.status,
//             uploaded_by: results.uploaded_by,
//             uploaded_date: results.uploaded_date,
//             file_size: results.file_size,
//             width: results.width,
//             height: results.height,
//         }
//     })

//     response = c.json(
//         {
//             success: true,
//             status: "ok",
//             query,
//             game,
//             asset,
//             tags,
//             results,
//         },
//         200,
//         responseHeaders
//     )

//     response.headers.set("Cache-Control", "s-maxage=3600")
//     await cache.put(cacheKey, response.clone())

//     return response
// }

// export async function recentAssets(c): Promise<Response> {
//     const cacheKey = new Request(c.req.url.toString(), c.req)
//     const cache = caches.default
//     let response = await cache.match(cacheKey)
//     if (response) return response

//     const conn = await getConnection(c.env)
//     const db = conn.planetscale

//     const row = await db
//         .execute(
//             "SELECT * FROM assets WHERE 1=1 ORDER BY uploaded_date DESC LIMIT 30"
//         )
//         .then((row) => row.rows as Asset[] | undefined)

//     if (!row) throw new Error("No results found")

//     const results = row.map((asset) => {
//         return {
//             id: asset.id,
//             name: asset.name,
//             game: asset.game,
//             asset_category: asset.asset_category,
//             url: asset.url,
//             tags: asset.tags,
//             status: asset.status,
//             uploaded_by: asset.uploaded_by,
//             uploaded_date: asset.uploaded_date,
//             file_size: asset.file_size,
//             width: asset.width,
//             height: asset.height,
//         }
//     })

//     response = c.json(
//         {
//             success: true,
//             status: "ok",
//             results,
//         },
//         200,
//         responseHeaders
//     )

//     response.headers.set("Cache-Control", "s-maxage=3600")
//     await cache.put(cacheKey, response.clone())

//     return response
// }
