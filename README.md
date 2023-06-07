<div align="center">

![Banner]

![API Response] ![API Response 24h] ![API Response 7d]  
![CDN Response] ![CDN Response 24h] ![CDN Response 7d]

Source code for the API/CDN powering [**wanderer.moe**](https://wanderer.moe) — using **Cloudflare Workers** (`api.wanderer.moe`) **and Cloudflare's R2 Storage** (`cdn.wanderer.moe`).

</div>

---

## Usage

#### Wrangler / Cloudflare Workers

Configuration files are inside `wrangler.toml`.

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
[API Response]: https://img.shields.io/endpoint?label=API%20Response&style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fwanderer-moe%2Fstatus%2FHEAD%2Fapi%2Fapi%2Fresponse-time.json
[API Response 24h]: https://img.shields.io/endpoint?label=API%20Response%20%2824h%29&style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fwanderer-moe%2Fstatus%2FHEAD%2Fapi%2Fapi%2Fresponse-time-day.json
[API Response 7d]: https://img.shields.io/endpoint?label=API%20Response%20%281wk%29&style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fwanderer-moe%2Fstatus%2FHEAD%2Fapi%2Fapi%2Fresponse-time-week.json
[CDN Response]: https://img.shields.io/endpoint?label=CDN%20Response&style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fwanderer-moe%2Fstatus%2FHEAD%2Fapi%2Fcdn%2Fresponse-time.json
[CDN Response 24h]: https://img.shields.io/endpoint?label=CDN%20Response%20%2824h%29&style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fwanderer-moe%2Fstatus%2FHEAD%2Fapi%2Fcdn%2Fresponse-time-day.json
[CDN Response 7d]: https://img.shields.io/endpoint?label=CDN%20Response%20%281wk%29&style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fwanderer-moe%2Fstatus%2FHEAD%2Fapi%2Fcdn%2Fresponse-time-week.json
[Cloudflare API Token]: https://dash.cloudflare.com/profile/api-tokens
[Dromzeh]: https://github.com/dromzeh
[api.wanderer.moe]: https://api.wanderer.moe
[License]: LICENSE
