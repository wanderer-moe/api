import { S3Client } from "@aws-sdk/client-s3";

const accessKeyId = "";
const secretAccessKey = "";
const accountId = "";

if (!accessKeyId || !secretAccessKey)
    throw new Error("Missing R2 access key or secret key");

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export { S3 };
