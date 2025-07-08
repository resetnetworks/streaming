// utils/cloudfront.js
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const privateKey = fs.readFileSync(
  path.resolve("cloudfront-private.pem"), // <-- this is your private key file
  "utf8"
);

const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
const domain = process.env.CLOUDFRONT_DOMAIN;

export const getSignedCloudFrontUrl = (uuid, expiresInSeconds = 3600) => {
  const url = `https://${domain}/${uuid}/${uuid}_hls.m3u8`;

  return getSignedUrl({
    url,
    keyPairId,
    privateKey,
    dateLessThan: new Date(Date.now() + expiresInSeconds * 1000),
  });
};

