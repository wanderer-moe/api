<div align="center">

![Banner]

![Quality] ![API Response] ![CDN Response]

Source code for the API powering [**wanderer.moe**](https://wanderer.moe) — using **Cloudflare Workers** with **R2 Storage** for the CDN, and **D1** for the Database.

</div>

---

## Usage

#### Wrangler

Configuration is in `wrangler.toml` - this includes the R2 Bucket and D1 Database.

-   Run `wrangler dev` to preview locally.
-   Run `wrangler deploy` to publish to Cloudflare Workers.

#### Actions

-   There is a GitHub Action that automatically deploys to Cloudflare Workers on every push to `main` — you can find it in `.github/workflows/deploy.yml`.

-   If you're using Github Actions, you will have to setup a secret with a Cloudflare API token. You can generate the API token [here][Cloudflare API Token] — use the `Edit Cloudflare Workers` template.

## API Reference

### Search (Assets)

#### Search Assets

```http
GET /search/assets?query=query&tags=tag1,tag2&after=after
```

| Parameter | Type     | Description                                                                                    |
| :-------- | :------- | :--------------------------------------------------------------------------------------------- |
| `query`   | `string` | **Optional**. Search query for assets                                                          |
| `tags`    | `string` | **Optional**. Comma-separated list of tags to filter by (in order of `game`, `asset-category`) |
| `after`   | `string` | **Optional**. Cursor to paginate through results                                               |

If no query is provided, the API will return a list of 100 most recently uploaded assets.

### Search Users

#### Search Users (Name)

```http
GET /user/search/:query
```

| Parameter | Type     | Description                          |
| :-------- | :------- | :----------------------------------- |
| `query`   | `string` | **Required**. Search query for users |

#### Get User Data (ID)

```http
GET /user/:id
```

| Parameter | Type     | Description                          |
| :-------- | :------- | :----------------------------------- |
| `id`      | `string` | **Required**. Search query for users |

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
