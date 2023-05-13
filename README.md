# api.wanderer.moe

Source code for the API powering [wanderer.moe](https://wanderer.moe) - using Cloudflare Workers (`api.wanderer.moe`) and Cloudflare's R2 Storage (`cdn.wanderer.moe`)

**API:**

[![api response time](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdromzeh%2Fstatus.wanderer.moe%2FHEAD%2Fapi%2Fapi%2Fresponse-time.json)](https://status.wanderer.moe/history/api)
[![api response time 24h](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdromzeh%2Fstatus.wanderer.moe%2FHEAD%2Fapi%2Fapi%2Fresponse-time-day.json)](https://status.wanderer.moe/history/api)
[![api response 7d](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdromzeh%2Fstatus.wanderer.moe%2FHEAD%2Fapi%2Fapi%2Fresponse-time-week.json)](https://status.wanderer.moe/history/api)

**CDN:**

[![cdn response time](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdromzeh%2Fstatus.wanderer.moe%2FHEAD%2Fapi%2Fcdn%2Fresponse-time.json)](https://status.wanderer.moe/history/cdn)
[![cdn response time 24h](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdromzeh%2Fstatus.wanderer.moe%2FHEAD%2Fapi%2Fcdn%2Fresponse-time-day.json)](https://status.wanderer.moe/history/cdn)
[![cdn response 7d](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdromzeh%2Fstatus.wanderer.moe%2FHEAD%2Fapi%2Fcdn%2Fresponse-time-week.json)](https://status.wanderer.moe/history/cdn)

## Usage

All configuration stuff is inside `wrangler.toml`.

- `wrangler dev` to run locally.

- `wrangler publish` to publish to Cloudflare Workers.

## Authors

- [@dromzeh](https://github.com/dromzeh)

## License

- [api.wanderer.moe](https://api.wanderer.moe) is licensed under [GNU Affero General Public License v3.0](LICENSE) - You must state all significant changes made to the original software, make the source code available to the public with credit to the original author, original source, and use the same license.
