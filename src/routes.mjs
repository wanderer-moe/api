import { Router } from "itty-router";
const router = Router();

router.get(
  "/",
  () =>
    new Response(
      JSON.stringify({
        success: true,
        status: "ok",
        path: "/",
        routes: [
          "https://api.wanderer.moe/games",
          "https://api.wanderer.moe/game/{gameId}",
          "https://api.wanderer.moe/game/{gameId}/{asset}",
          "https://api.wanderer.moe/oc-generators",
          "https://api.wanderer.moe/oc-generator/{gameId}",
        ],
      }),
      {
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*",
        },
      }
    )
);

// oc genertor routes
router.get("/oc-generators", async (request, env) => {
  const files = await env.bucket.list({
    prefix: "oc-generator/",
    delimiter: "/",
  });

  const locations = files.delimitedPrefixes.map((file) => {
    return {
      name: file.replace("oc-generator/", "").replace("/", ""),
      path: `https://api.wanderer.moe/oc-generator/${file
        .replace("oc-generator/", "")
        .replace("/", "")}`,
    };
  });

  return new Response(
    JSON.stringify({
      status: "ok",
      path: "/oc-generators",
      locations: locations,
    }),
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "access-control-allow-origin": "*",
      },
    }
  );
});

router.get("/oc-generator/:gameId", async (request, env) => {
  const { gameId } = request.params;

  const files = await env.bucket.list({
    prefix: `oc-generator/${gameId}/list.json`,
  });

  if (files.objects.length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        error: "404 Not Found",
      }),
      {
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*",
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: `/oc-generator/${gameId}`,
      game: gameId,
      json: `https://cdn.wanderer.moe/oc-generator/${gameId}/list.json`,
    }),
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "access-control-allow-origin": "*",
      },
    }
  );
});

// games routes
router.get("/games", async (request, env) => {
  const files = await env.bucket.list({
    prefix: "",
    delimiter: "/",
  });

  const unwantedFiles = ["other/", "locales/", "covers/", "oc-generator/"];
  const rootLocations = [];

  for (const game of files.delimitedPrefixes) {
    if (unwantedFiles.includes(game)) {
      continue;
    }

    const gameFiles = await env.bucket.list({
      prefix: `${game}`,
      delimiter: "/",
    });

    let tags = [];

    const gameSubfolders = gameFiles.delimitedPrefixes.map((subfolder) => {
      return {
        name: subfolder.replace(game, "").replace("/", ""),
        path: `https://api.wanderer.moe/game/${subfolder}`,
      };
    });

    if (gameSubfolders.some((subfolder) => subfolder.name.includes("sheets"))) {
      tags.push("Has Sheets");
    }

    rootLocations.push({
      name: game.replace("/", ""),
      path: `https://api.wanderer.moe/game/${game}`,
      tags: tags,
      subfolders: gameSubfolders,
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: "/games",
      games: rootLocations,
    }),
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "access-control-allow-origin": "*",
      },
    }
  );
});

router.get("/game/:gameId", async (request, env) => {
  const { gameId } = request.params;

  const files = await env.bucket.list({
    prefix: `${gameId}/`,
    delimiter: "/",
  });

  const locations = files.delimitedPrefixes.map((file) => {
    return {
      name: file.replace(`${gameId}/`, "").replace("/", ""),
      path: `https://api.wanderer.moe/game/${gameId}/${file
        .replace(`${gameId}/`, "")
        .replace("/", "")}`,
    };
  });

  if (files.objects.length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        path: `/game/${gameId}`,
        error: "404 Not Found",
      }),
      {
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*",
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: `/game/${gameId}`,
      game: gameId,
      locations: locations,
    }),
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "access-control-allow-origin": "*",
      },
    }
  );
});

router.get("/game/:gameId/:asset", async (request, env) => {
  const { gameId, asset } = request.params;

  const files = await env.bucket.list({
    prefix: `${gameId}/${asset}/`,
  });

  if (files.objects.length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        path: `/game/${gameId}/${asset}`,
        error: "404 Not Found",
      }),
      {
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*",
        },
      }
    );
  }

  const images = files.objects.map((file) => {
    return {
      name: file.key.split("/").pop().replace(".png", ""),
      nameWithExtension: file.key.split("/").pop(),
      path: "https://cdn.wanderer.moe/" + file.key,
      uploaded: file.uploaded,
      size: file.size,
    };
  });

  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: `/game/${gameId}/${asset}`,
      game: gameId,
      asset: asset,
      images: images,
    }),
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "access-control-allow-origin": "*",
      },
    }
  );
});

// other routes
router.all(
  "*",
  () =>
    new Response(
      JSON.stringify({
        success: false,
        status: "error",
        error: "404 Not Found",
      }),
      {
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*",
        },
      }
    )
);

// event listener
addEventListener("fetch", (event) =>
  event.respondWith(router.handle(event.request))
);

export { router };
