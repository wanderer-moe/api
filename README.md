<div align="center">

![Banner]

![Quality]

Source code for the API powering [**wanderer.moe**](https://wanderer.moe) — using **Cloudflare Workers** and **Hono** with **R2 Storage** for the CDN, **Turso** and **Drizzle**.

</div>

---

## Usage

### Turso

We use Turso as our database. You will need to install the [Turso CLI](https://docs.turso.tech/reference/turso-cli#installation) then run `turso dev` to start a local database. You can persist data by passing `--db-file <path>`.

The Turso CLI can be ran on Windows using WSL.

The API will connect to the local database if the environment is set to `DEV`, else - it will connect to your production database.

To generate seed data, generate and migrate, you can run `pnpm drizzle:init:dev`.

### Wrangler

Configuration is in `wrangler.toml`.

You will require either a workers paid plan **or to set your worker to unbound** for authentication and password hashing to work.

Required environment variables are viewable in `./src/worker-configuration.d.ts`.

-   Run `wrangler dev` to preview locally.
-   Run `wrangler deploy` to publish to Cloudflare Workers.

### Actions

-   There is a GitHub Action that automatically deploys to Cloudflare Workers on every push to `main` — you can find it in `.github/workflows/deploy.yml`.

-   If you're using Github Actions, you will have to setup a secret with a Cloudflare API token. You can generate the API token [here][Cloudflare API Token] — use the `Edit Cloudflare Workers` template.

### Database

-   When migrating, you will need `tsx`.
-   It's not reccomended to use `drizzle:push` in production. However, there is `drizzle:generate` & `drizzle:migrate` available as scripts.

## Authors

-   [@dromzeh][Dromzeh]

## License

[api.wanderer.moe][api.wanderer.moe] is licensed under the [GNU Affero General Public License v3.0][License] - **You must state all significant changes made to the original software, make the source code available to the public with credit to the original author, original source, and use the same license.**

[Banner]: https://files.catbox.moe/qa3eus.svg
[Quality]: https://img.shields.io/codefactor/grade/github/wanderer-moe/api?label=quality&style=for-the-badge
[Cloudflare API Token]: https://dash.cloudflare.com/profile/api-tokens
[Dromzeh]: https://github.com/dromzeh
[api.wanderer.moe]: https://api.wanderer.moe
[License]: LICENSE
