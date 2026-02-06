// src/utils/s3Utils.js
export const getS3Url = (imageKey) => {
  if (!imageKey) return null;
  
  if (imageKey.startsWith('http')) return imageKey;
  if (imageKey.startsWith('data:')) return imageKey;
  
  const bucket = process.env.REACT_APP_S3_BUCKET || 'reset-streaming';
  const region = process.env.REACT_APP_S3_REGION || 'ap-south-1';
  
  if (bucket && region) {
    return `https://${bucket}.s3.${region}.amazonaws.com/${imageKey}`;
  }
  
  return imageKey;
};