import { MediaConvertClient } from "@aws-sdk/client-mediaconvert";

const mediaConvertClient = new MediaConvertClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.MEDIACONVERT_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export default mediaConvertClient;
