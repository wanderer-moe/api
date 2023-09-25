export const listBucket = async (bucket: Bindings["FILES_BUCKET"], options) => {
    return await bucket.list(options)
}
