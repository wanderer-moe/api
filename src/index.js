export default {
  async fetch(request, env) {
    try {
      const {
        pathname
      } = new URL(request.url)

      if (pathname === '/') {
        // Return all possible API routes as JSON
        return new Response(JSON.stringify({
          "status": "ok",
          "path": pathname,
          "routes": [
            "https://api.wanderer.moe/games",
            "https://api.wanderer.moe/game/{gameId}",
            "https://api.wanderer.moe/game/{gameId}/{asset}",
          ]
        }), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "access-control-allow-origin": "*"
          }
        })
      }

      if (pathname.startsWith('/oc-generators')) {
        const files = await env.bucket.list({
          prefix: 'oc-generator/',
          delimiter: '/'
        })

        const locations = files.delimitedPrefixes.map((file) => {
          return {
            name: file.replace('oc-generator/', '').replace('/', ''), // remove oc-generator/ and / from the end of the string
            path: `https://api.wanderer.moe/oc-generator/${file.replace('oc-generator/', '').replace('/', '')}`
          };
        });

        return new Response(JSON.stringify({
          "status": "ok",
          "path": pathname,
          "locations": locations,
        }), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "access-control-allow-origin": "*"
          }
        })
      }


      if (pathname.startsWith('/oc-generator/')) {
        const [, game] = pathname.split('/').filter((x) => x !== '');
        const files = await env.bucket.list({
          prefix: `oc-generator/${game}/list.json`
        })

        // If there are no files, return 404 error
        if (files.objects.length === 0) {
          return new Response(JSON.stringify({
            "status": "error",
            "error": "404 Not Found"
          }), {
            headers: {
              "content-type": "application/json;charset=UTF-8",
              "access-control-allow-origin": "*"
            }
          })
        }

        return new Response(JSON.stringify({
          "status": "ok",
          "path": pathname,
          "game": game,
          "json": `https://cdn.wanderer.moe/oc-generator/${game}/list.json`
        }), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "access-control-allow-origin": "*"
          }
        })
      }

      if (pathname.startsWith('/games')) {
        const files = await env.bucket.list({
          prefix: '',
          delimiter: '/'
        })

        const unwantedFiles = ["other/", "locales/", "covers/", "oc-generator/"];
        const rootLocations = [];

        for (const game of files.delimitedPrefixes) {
          if (unwantedFiles.includes(game)) {
            continue;
          }

          const gameFiles = await env.bucket.list({
            prefix: `${game}`,
            delimiter: '/'
          })

          let tags = [];

          const gameSubfolders = gameFiles.delimitedPrefixes.map((subfolder) => {
            return {
              name: subfolder.replace(game, '').replace('/', ''),
              path: `https://api.wanderer.moe/game/${subfolder}`
            };
          });

          // if 'sheets' is in gameSubfolders, add 'Has Sheets' tag
          if (gameSubfolders.some((subfolder) => subfolder.name.includes('sheets'))) {
            tags.push('Has Sheets');
          }

          rootLocations.push({
            name: game.replace('/', ''),
            path: `https://api.wanderer.moe/game/${game}`,
            tags: tags,
            subfolders: gameSubfolders
          });
        }

        return new Response(JSON.stringify({
          "status": "ok",
          "path": pathname,
          "games": rootLocations
        }), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "access-control-allow-origin": "*"
          }
        })
      }

      if (pathname.startsWith('/game/')) {
        const [, gameId, asset] = pathname.split('/').filter((x) => x !== '');
        if (asset) { // Return all images inside /{gameId}/{asset} as JSON
          const files = await env.bucket.list({
            prefix: `${gameId}/${asset}/`
          })

          // If there are no files, return 404 error
          if (files.objects.length === 0) {
            return new Response(JSON.stringify({
              "status": "error",
              "path": pathname,
              "error": "404 Not Found"
            }), {
              headers: {
                "content-type": "application/json;charset=UTF-8",
                "access-control-allow-origin": "*"
              }
            })
          }

          const images = files.objects.map((file) => {
            return {
              name: file.key.split('/').pop().replace('.png', ''),
              nameWithExtension: file.key.split('/').pop(),
              path: "https://cdn.wanderer.moe/" + file.key,
              uploaded: file.uploaded,
              size: file.size
            }
          })

          return new Response(JSON.stringify({
            "status": "ok",
            "path": pathname,
            "game": gameId,
            "asset": asset,
            "images": images,
          }), {
            headers: {
              "content-type": "application/json;charset=UTF-8",
              "access-control-allow-origin": "*"
            }
          })
        }

        // Return all paths for a game as JSON
        const files = await env.bucket.list({
          prefix: `${gameId}/`,
          delimiter: '/'
        })

        const locations = files.delimitedPrefixes.map((file) => {
          return {
            name: file.replace(`${gameId}/`, '').replace('/', ''), // remove gameId/ and / from the end of the string
            path: `https://api.wanderer.moe/game/${gameId}/${file.replace(`${gameId}/`, '').replace('/', '')}`
          };
        });

        // If there are no files, return 404 error
        if (files.objects.length === 0) {
          return new Response(JSON.stringify({
            "status": "error",
            "path": pathname,
            "error": "404 Not Found"
          }), {
            headers: {
              "content-type": "application/json;charset=UTF-8",
              "access-control-allow-origin": "*"
            }
          })
        }

        return new Response(JSON.stringify({
          "path": pathname,
          "game": gameId,
          "locations": locations,
        }), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "access-control-allow-origin": "*"
          }
        })
      } // error handling 
      else {
        return new Response(JSON.stringify({
          "status": "error",
          "path": pathname,
          "error": "404 Not Found"
        }), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "access-control-allow-origin": "*"
          }
        })
      }
    } catch (err) {
      return new Response(JSON.stringify({
        "status": "error",
        "path": pathname,
        "error": "500 Internal Server Error"
      }), {
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*"
        }
      })
    }
  }
}