// test-cloudfront.js
import fs from "fs";
import path from "path";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import dotenv from "dotenv";
dotenv.config();

// Read private key
const privateKey = fs.readFileSync(
  path.resolve("cloudfront-private.pem"),
  "utf8"
);

// Config
const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
const domain = process.env.CLOUDFRONT_DOMAIN;
const filePath = "/songs-hls/49ca9ec7-b7c5-4af6-9bf7-ec7cb945ef72/49ca9ec7-b7c5-4af6-9bf7-ec7cb945ef72_hls.m3u8";
const fullUrl = `https://${domain}${filePath}`;

// Debug logs
console.log("🔗 Signing CloudFront URL:", fullUrl);
console.log("🔑 Key Pair ID:", keyPairId);
console.log("📝 Private Key:", privateKey.slice(0, 50) + "..."); // Truncated for safety

// Generate signed URL
(async () => {
  try {
    const signedUrl = await getSignedUrl({
      url: fullUrl,
      keyPairId,
      privateKey,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000), // valid for 1 hour
    });

    console.log("✅ Signed URL:", signedUrl);
  } catch (err) {
    console.error("❌ Error signing URL:", err.message);
  }
})();

