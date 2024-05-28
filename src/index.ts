import { router } from "@/handler";
// import { instrument, ResolveConfigFn } from "@microlabs/otel-cf-workers";

const handler = {
    fetch: router.handle,
};

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const config: ResolveConfigFn = (env: Env, _trigger) => {
//     return {
//         exporter: {
//             url: "https://otel.baselime.io/v1",
//             headers: { "x-api-key": env.BASELIME_API_KEY },
//         },
//         service: { name: env.SERVICE_NAME },
//     };
// };

// export default instrument(handler, config);

export default handler;
