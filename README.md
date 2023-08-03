<div align="center">

![Banner]

![Quality] ![API Response] ![CDN Response]

Source code for the API powering [**wanderer.moe**](https://wanderer.moe) — using **Cloudflare Workers** with **R2 Storage** for the CDN, and **Planetscale** for the Database.

</div>

---

## Usage

#### Wrangler

Configuration is in `wrangler.toml`.

You will need to setup environment variables for the Discord Bot Token for `/contributors` route: `DISCORD_TOKEN` and for Planetscale, using `wrangler secret put`.

-   Run `wrangler dev` to preview locally.
-   Run `wrangler deploy` to publish to Cloudflare Workers.

#### Actions

-   There is a GitHub Action that automatically deploys to Cloudflare Workers on every push to `main` — you can find it in `.github/workflows/deploy.yml`.

-   If you're using Github Actions, you will have to setup a secret with a Cloudflare API token. You can generate the API token [here][Cloudflare API Token] — use the `Edit Cloudflare Workers` template.

## API Reference

### Assets

#### Search Assets

```http
GET /search?query=query&game=game1,game2&asset=asset
```

| Parameter | Type     | Description                                                              |
| :-------- | :------- | :----------------------------------------------------------------------- |
| `query`   | `string` | **Optional**. Search query for assets                                    |
| `game`    | `string` | **Optional**. Can be a comma seperated list of game names to search for  |
| `asset`   | `string` | **Optional**. Can be a comma seperated list of asset types to search for |

The max response the API will give is always 1500 assets.

### Recent Assets

```
GET /recent
```

Returns the 30 most recent assets based off of the `uploaded_date` field.

### Download Asset

```http
GET /download/:assetId
```

Downloads the asset with the given `assetId`.

### Search Users

#### Search Users (Name)

```http
GET /user/s/:query
```

| Parameter | Type     | Description                          |
| :-------- | :------- | :----------------------------------- |
| `query`   | `string` | **Required**. Search query for users |

#### Get Username

```http
GET /user/:username
```

| Parameter  | Type     | Description            |
| :--------- | :------- | :--------------------- |
| `username` | `string` | **Required**. Username |

### OC Generator

#### Get All OC Generators

```http
GET /oc-generators/
```

#### Get OC Generator

```http
GET /oc-generators/:id
```

| Parameter | Type     | Description                                      |
| :-------- | :------- | :----------------------------------------------- |
| `id`      | `string` | **Required**. Game Name of OC Generator to fetch |

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
