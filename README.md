<div align="center">

![Banner]

![Quality]

Source code for the API powering [**wanderer.moe**](https://wanderer.moe) — using **Cloudflare Workers** and **Hono** with **R2 Storage** for the CDN, **Turso** and **Drizzle** for the Database.

</div>

---

## Usage

#### Wrangler

Configuration is in `wrangler.toml`.

You will require either a workers paid plan **or to set your worker to unbound** for authentication and password hashing to work.

You will need to setup environment variables for the Discord Bot Token for `/contributors` route: `DISCORD_TOKEN` and for your Turso DB, using `wrangler secret put`.

-   Run `wrangler dev` to preview locally.
-   Run `wrangler deploy` to publish to Cloudflare Workers.

#### Actions

-   There is a GitHub Action that automatically deploys to Cloudflare Workers on every push to `main` — you can find it in `.github/workflows/deploy.yml`.

-   If you're using Github Actions, you will have to setup a secret with a Cloudflare API token. You can generate the API token [here][Cloudflare API Token] — use the `Edit Cloudflare Workers` template.

## Authors

-   [@dromzeh][Dromzeh]

## License

[api.wanderer.moe][api.wanderer.moe] is licensed under the [GNU Affero General Public License v3.0][License] - **You must state all significant changes made to the original software, make the source code available to the public with credit to the original author, original source, and use the same license.**

[Banner]: https://files.catbox.moe/qa3eus.svg
[API Status]: https://status.wanderer.moe/history/api
[CDN Status]: https://status.wanderer.moe/history/cdn
[Quality]: https://img.shields.io/codefactor/grade/github/wanderer-moe/api?label=quality&style=for-the-badge
[Cloudflare API Token]: https://dash.cloudflare.com/profile/api-tokens
[Dromzeh]: https://github.com/dromzeh
[api.wanderer.moe]: https://api.wanderer.moe
[License]: LICENSE
