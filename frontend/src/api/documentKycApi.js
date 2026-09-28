// src/api/documentKycApi.js
import axios from "../utills/axiosInstance";

export const documentKycApi = {
  // 1. Get Presigned Upload URL
  getPresignedUploadUrl: async ({ fileName, mimeType, documentType, referenceId }) => {
    const payload = {
      fileName,
      mimeType,
      documentType,
    };
    if (referenceId) {
      payload.referenceId = referenceId;
    }
    const res = await axios.post("/document-verification/presign-upload", payload);
    return res.data;
    // Returns { uploadUrl, uploadHeaders, key, documentId }
  },

  // 3. Get Presigned View URL
  getPresignedViewUrl: async (documentId) => {
    const res = await axios.get(`/document-verification/view/${documentId}`);
    return res.data;
    // Returns { viewUrl, expiresIn }
  },
};
