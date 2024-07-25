export const listBucket = async (bucket: R2Bucket, options: R2ListOptions) => {
    const files = await bucket.list(options);
    return files;
};
