export const listBucket = async (bucket, options) => {
    const files = await bucket.list(options);
    return files;
};
