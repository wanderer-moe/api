import {
  Router
} from "itty-router";
import {
  responseHeaders
} from "./lib/responseHeaders.mjs";

const router = Router();

const errorHandler = (handler) => async (request, env) => {
  try {
    // console.log(request);
    return await handler(request, env);
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        error: "500 Internal Server Error",
      }), {
        headers: responseHeaders
      }
    );
  }
};

// index route
router.get("/", errorHandler(() => {
  // TODO: get all possible routes instead of hardcoding them, to be implemented at a later date
  const routes = [
    "https://api.wanderer.moe/games",
    "https://api.wanderer.moe/game/{gameId}",
    "https://api.wanderer.moe/game/{gameId}/{asset}",
    "https://api.wanderer.moe/oc-generators",
    "https://api.wanderer.moe/oc-generator/{gameId}",
  ];

  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: "/",
      routes,
    }), {
      headers: responseHeaders
    }
  );
}));

// gets all oc generators
router.get("/oc-generators", errorHandler(async (request, env) => {
  const files = await env.bucket.list({
    prefix: "oc-generator/",
    delimiter: "/",
  });

  const locations = files.delimitedPrefixes.map((file) => ({
    name: file.replace("oc-generator/", "").replace("/", ""),
    path: `https://api.wanderer.moe/oc-generator/${file.replace("oc-generator/", "").replace("/", "")}`,
  }));

  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: "/oc-generators",
      locations,
    }), {
      headers: responseHeaders
    }
  );
}));

// gets oc generator for a game
router.get("/oc-generator/:gameId", errorHandler(async (request, env) => {
  const {
    gameId
  } = request.params;

  const files = await env.bucket.list({
    prefix: `oc-generator/${gameId}/list.json`,
  });

  if (files.objects.length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        error: "404 Not Found",
      }), {
        headers: responseHeaders
      }
    );
  }

  // TODO: don't seperate the link for the json file, implement it into the response, to be implemented at a later date
  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: `/oc-generator/${gameId}`,
      game: gameId,
      json: `https://cdn.wanderer.moe/oc-generator/${gameId}/list.json`,
    }), {
      headers: responseHeaders
    }
  );
}));

// gets all games
router.get("/games", errorHandler(async (request, env) => {
  const files = await env.bucket.list({
    prefix: "",
    delimiter: "/",
  });

  const unwantedFiles = ["other/", "locales/", "covers/", "oc-generator/"];

  const rootLocations = files.delimitedPrefixes
    .filter((game) => !unwantedFiles.includes(game))
    .map(async (game) => {
      const gameFiles = await env.bucket.list({
        prefix: `${game}`,
        delimiter: "/",
      });

      const tags = gameFiles.delimitedPrefixes.some((subfolder) => subfolder.includes("sheets")) ? ["Has Sheets"] : [];

      const subfolders = gameFiles.delimitedPrefixes.map((subfolder) => ({
        name: subfolder.replace(game, "").replace("/", ""),
        path: `https://api.wanderer.moe/game/${subfolder}`,
      }));

      return {
        name: game.replace("/", ""),
        path: `https://api.wanderer.moe/game/${game}`,
        tags,
        subfolders,
      };
    });

  const games = await Promise.all(rootLocations);

  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: "/games",
      games,
    }), {
      headers: responseHeaders
    }
  );
}));

// gets asset categories for a game
router.get("/game/:gameId", errorHandler(async (request, env) => {
  const {
    gameId
  } = request.params;

  const files = await env.bucket.list({
    prefix: `${gameId}/`,
    delimiter: "/",
  });

  const locations = files.delimitedPrefixes.map((file) => ({
    name: file.replace(`${gameId}/`, "").replace("/", ""),
    path: `https://api.wanderer.moe/game/${gameId}/${file.replace(`${gameId}/`, "").replace("/", "")}`,
  }));

  if (files.objects.length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        path: `/game/${gameId}`,
        error: "404 Not Found",
      }), {
        headers: responseHeaders
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: `/game/${gameId}`,
      game: gameId,
      locations,
    }), {
      headers: responseHeaders
    }
  );
}));

// gets all assets for a game
router.get("/game/:gameId/:asset", errorHandler(async (request, env) => {
  const {
    gameId,
    asset
  } = request.params;

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
      }), {
        headers: responseHeaders
      }
    );
  }

  const images = files.objects.map((file) => ({
    name: file.key.split("/").pop().replace(".png", ""),
    nameWithExtension: file.key.split("/").pop(),
    path: `https://cdn.wanderer.moe/${file.key}`,
    uploaded: file.uploaded,
    size: file.size,
  }));

  return new Response(
    JSON.stringify({
      success: true,
      status: "ok",
      path: `/game/${gameId}/${asset}`,
      game: gameId,
      asset,
      images,
    }), {
      headers: responseHeaders
    }
  );
}));

router.all("*", errorHandler(() => {
  return new Response(
    JSON.stringify({
      success: false,
      status: "error",
      error: "404 Not Found",
    }), {
      headers: responseHeaders
    }
  );
}));

// event listener for fetch events
addEventListener("fetch", (event) => {
  event.respondWith(router.handle(event.request));
});

export {
  router
};