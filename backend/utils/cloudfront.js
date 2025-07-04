// utils/cloudfront.js
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const privateKey = fs.readFileSync(
  path.resolve("cloudfront-private.pem"),
  "utf8"
);

const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
const domain = process.env.CLOUDFRONT_DOMAIN;

export const getSignedCloudFrontUrl = (audioKey) => {
  const m3u8Url = `https://${domain}/${audioKey}/${audioKey}_hls.m3u8`;
  const wildcardResource = `https://${domain}/${audioKey}/*`;
  const expires = Math.floor(Date.now() / 1000) + 60 * 60;

  const policy = JSON.stringify({
    Statement: [
      {
        Resource: wildcardResource,
        Condition: {
          DateLessThan: { "AWS:EpochTime": expires },
        },
      },
    ],
  });

console.log("Generating CloudFront signed URL with:");
console.log({
  m3u8Url,
  wildcardResource,
  expires,
  policy,
});

return getSignedUrl({
  url: m3u8Url,
  keyPairId,
  privateKey,
  dateLessThan: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
});
};

