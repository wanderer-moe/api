export const listBucket = async (bucket: Bindings["bucket"], options) => {
    return await bucket.list(options)
}
