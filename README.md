<div align="center">

![Banner]

![Quality] ![API Response] ![CDN Response]

Source code for the API powering [**wanderer.moe**](https://wanderer.moe) — using **Cloudflare Workers** with **R2 Storage** for the CDN.

</div>

---

## Usage

#### Wrangler

Configuration is in `wrangler.toml` - this includes the R2 Bucket.

-   Run `wrangler dev` to preview locally.
-   Run `wrangler deploy` to publish to Cloudflare Workers.

#### Actions

-   There is a GitHub Action that automatically deploys to Cloudflare Workers on every push to `main` — you can find it in `.github/workflows/deploy.yml`.

-   If you're using Github Actions, you will have to setup a secret with a Cloudflare API token. You can generate the API token [here][Cloudflare API Token] — use the `Edit Cloudflare Workers` template.

## API Reference

### Games

#### Get all games

```http
  GET api.wanderer.moe/games
```

#### Get game data

```http
  GET api.wanderer.moe/game/${gameId}
```

| Parameter | Type     | Description                         |
| :-------- | :------- | :---------------------------------- |
| `gameId`  | `string` | **Required** — game to get data for |

#### Get a game's asset data

```http
  GET api.wanderer.moe/game/${gameId}/${asset}
```

| Parameter | Type     | Description                          |
| :-------- | :------- | :----------------------------------- |
| `gameId`  | `string` | **Required** — game to get data for  |
| `asset`   | `string` | **Required** — asset to get data for |

## Authors

-   [@dromzeh][Dromzeh]

## License

[api.wanderer.moe][api.wanderer.moe] is licensed under the [GNU Affero General Public License v3.0][License] - **You must state all significant changes made to the original software, make the source code available to the public with credit to the original author, original source, and use the same license.**

[Banner]: https://files.catbox.moe/qa3eus.svg
[API Status]: https://status.wanderer.moe/history/api
[CDN Status]: https://status.wanderer.moe/history/cdn
[API Response]: https://img.shields.io/endpoint?label=API%20Response&style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fwanderer-moe%2Fstatus%2FHEAD%2Fapi%2Fapi%2Fresponse-time.json
[CDN Response]: https://img.shields.io/endpoint?label=CDN%20Response&style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fwanderer-moe%2Fstatus%2FHEAD%2Fapi%2Fcdn%2Fresponse-time.json
[Quality]: https://img.shields.io/codefactor/grade/github/wanderer-moe/api?label=quality&style=for-the-badge
[Cloudflare API Token]: https://dash.cloudflare.com/profile/api-tokens
[Dromzeh]: https://github.com/dromzeh
[api.wanderer.moe]: https://api.wanderer.moe
[License]: LICENSE
