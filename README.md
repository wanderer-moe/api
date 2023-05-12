# api.wanderer.moe

- Source code for the API powering [wanderer.moe](https://wanderer.moe) - using Cloudflare Workers (`api.wanderer.moe`) and Cloudflare's R2 Storage (`cdn.wanderer.moe`)

## Usage

All configuration stuff is inside `wrangler.toml`.

- `wrangler dev` to run locally.

- `wrangler publish` to publish to Cloudflare Workers.

## API Reference

### Get Game

```http
  GET /game/{gameId}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `gameId` | `string` | **Required**. Specifies the game to get details from. |

The API returns all the subfolders inside of the bucket's `/{gameId}/` directory, including time modified & file size converted to human readable format.

### Get Game/Asset

```http
  GET /game/{gameId}/{asset}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `gameId` | `string` | **Required**. Specifies game to get details from. |
| `asset` | `string` | **Required**. The asset category from the game. |

The API returns all files inside the bucket's `/{gameId}/{asset}` directory.

### Get All Games

```http
  GET /games
```

The API returns all files inside the bucket's root, excluding `/{gameId}/{asset}(/{file})`.

## Authors

- [@dromzeh](https://github.com/dromzeh)

## License

- [api.wanderer.moe](https://api.wanderer.moe) is licensed under [GNU Affero General Public License v3.0](LICENSE) - You must state all significant changes made to the original software, make the source code available to the public with credit to the original author, original source, and use the same license.
