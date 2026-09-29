// delete this file when see next.

// import React, { useState } from 'react';
// import axios from 'axios';
// import { documentKycApi } from '../api/documentKycApi';
// import { FaUpload, FaCheckCircle, FaRegFileAlt, FaExclamationCircle, FaEye, FaSpinner } from 'react-icons/fa';
// import { toast } from 'sonner'; // Assuming sonner is used for toasts based on package.json

// const DocumentVerification = () => {
//   const [file, setFile] = useState(null);
//   const [documentType, setDocumentType] = useState('gov_id');
//   const [loading, setLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadedDocumentId, setUploadedDocumentId] = useState(null);

//   const [viewLoading, setViewLoading] = useState(false);
//   const [viewUrl, setViewUrl] = useState('');

//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//     }
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       toast.error('Please select a file first.');
//       return;
//     }

//     try {
//       setLoading(true);
//       setUploadProgress(10); // Start progress

//       // Step 1: Get presigned upload URL + the SSE-KMS headers the browser must send
//       const { uploadUrl, uploadHeaders, documentId } = await documentKycApi.getPresignedUploadUrl({
//         fileName: file.name,
//         mimeType: file.type || 'application/octet-stream',
//         documentType,
//       });

//       setUploadProgress(40);

//       // Step 2: Upload to S3 directly
//       // uploadHeaders contains x-amz-server-side-encryption + x-amz-server-side-encryption-aws-kms-key-id.
//       // These must be sent to satisfy the presigned URL signature — S3 enforces KMS encryption this way.
//       await axios.put(uploadUrl, file, {
//         headers: {
//           'Content-Type': file.type || 'application/octet-stream',
//           ...uploadHeaders,
//         },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           // Scale from 40% to 100%
//           setUploadProgress(40 + Math.floor(percentCompleted * 0.6));
//         }
//       });

//       setUploadedDocumentId(documentId);
//       toast.success('Document uploaded successfully!');
//     } catch (error) {
//       console.error('Upload Error:', error);
//       toast.error(error.response?.data?.message || 'Failed to upload document.');
//     } finally {
//       setLoading(false);
//       setUploadProgress(0);
//     }
//   };

//   const handleViewDocument = async () => {
//     if (!uploadedDocumentId) return;

//     try {
//       setViewLoading(true);
//       const { viewUrl } = await documentKycApi.getPresignedViewUrl(uploadedDocumentId);
//       setViewUrl(viewUrl);

//       // Auto-hide the view URL after 30 seconds since it expires
//       setTimeout(() => {
//         setViewUrl('');
//         toast.info('Document view link expired.');
//       }, 30000);

//     } catch (error) {
//       console.error('View Error:', error);
//       toast.error(error.response?.data?.message || 'Failed to load document view URL.');
//     } finally {
//       setViewLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-neutral-900 text-white p-6 flex flex-col items-center justify-center">
//       <div className="max-w-2xl w-full bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-700">

//         {/* Header */}
//         <div className="p-8 border-b border-neutral-700">
//           <h1 className="text-2xl font-bold flex items-center gap-3">
//             <FaRegFileAlt className="text-blue-500" />
//             Document Verification
//           </h1>
//           <p className="text-neutral-400 mt-2">
//             Upload your KYC documents securely. Files are encrypted with KMS and stored safely.
//           </p>
//         </div>

//         {/* Content */}
//         <div className="p-8 space-y-6">

//           {!uploadedDocumentId ? (
//             <>
//               {/* Document Type Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-neutral-300 mb-2">
//                   Document Type
//                 </label>
//                 <select
//                   value={documentType}
//                   onChange={(e) => setDocumentType(e.target.value)}
//                   className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                   disabled={loading}
//                 >
//                   <option value="government_id">Government ID (Passport, DL, etc.)</option>
//                   <option value="pan">PAN Card</option>
//                   <option value="aadhaar">Aadhaar Card</option>
//                 </select>
//               </div>

//               {/* File Upload Area */}
//               <div>
//                 <label className="block text-sm font-medium text-neutral-300 mb-2">
//                   Upload File
//                 </label>
//                 <div
//                   className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-600 hover:border-neutral-500 bg-neutral-900/50'
//                     }`}
//                 >
//                   <input
//                     type="file"
//                     id="file-upload"
//                     className="hidden"
//                     onChange={handleFileChange}
//                     disabled={loading}
//                     accept="image/*,.pdf"
//                   />
//                   <label
//                     htmlFor="file-upload"
//                     className="cursor-pointer flex flex-col items-center justify-center space-y-3"
//                   >
//                     <div className={`p-3 rounded-full ${file ? 'bg-blue-500' : 'bg-neutral-800'}`}>
//                       <FaUpload className={`w-6 h-6 ${file ? 'text-white' : 'text-neutral-400'}`} />
//                     </div>
//                     <div>
//                       {file ? (
//                         <p className="font-medium text-blue-400">{file.name}</p>
//                       ) : (
//                         <p className="font-medium text-neutral-300">Click to browse or drag and drop</p>
//                       )}
//                       <p className="text-xs text-neutral-500 mt-1">Images or PDF (max 10MB)</p>
//                     </div>
//                   </label>
//                 </div>
//               </div>

//               {/* Progress Bar */}
//               {loading && uploadProgress > 0 && (
//                 <div className="w-full bg-neutral-700 rounded-full h-2.5 overflow-hidden">
//                   <div
//                     className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
//                     style={{ width: `${uploadProgress}%` }}
//                   ></div>
//                 </div>
//               )}

//               {/* Action Button */}
//               <button
//                 onClick={handleUpload}
//                 disabled={!file || loading}
//                 className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition ${!file || loading
//                   ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
//                   : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
//                   }`}
//               >
//                 {loading ? (
//                   <>
//                     <FaSpinner className="w-5 h-5 animate-spin" />
//                     Uploading... {uploadProgress}%
//                   </>
//                 ) : (
//                   <>
//                     <FaUpload className="w-5 h-5" />
//                     Upload Document
//                   </>
//                 )}
//               </button>
//             </>
//           ) : (

//             // Success State
//             <div className="text-center py-6">
//               <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <FaCheckCircle className="w-8 h-8 text-green-500" />
//               </div>
//               <h3 className="text-xl font-bold text-white mb-2">Upload Successful</h3>
//               <p className="text-neutral-400 mb-6">
//                 Your document has been securely encrypted and stored.
//                 <br />
//                 <span className="text-sm font-mono bg-neutral-900 px-2 py-1 rounded mt-2 inline-block">
//                   Ref ID: {uploadedDocumentId}
//                 </span>
//               </p>

//               <div className="flex gap-4 justify-center">
//                 <button
//                   onClick={() => {
//                     setUploadedDocumentId(null);
//                     setFile(null);
//                     setViewUrl('');
//                   }}
//                   className="px-6 py-2.5 rounded-lg font-medium bg-neutral-700 hover:bg-neutral-600 text-white transition"
//                 >
//                   Upload Another
//                 </button>
//                 <button
//                   onClick={handleViewDocument}
//                   disabled={viewLoading}
//                   className="px-6 py-2.5 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-2 shadow-lg shadow-indigo-500/30"
//                 >
//                   {viewLoading ? (
//                     <FaSpinner className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <FaEye className="w-4 h-4" />
//                   )}
//                   View Document
//                 </button>
//               </div>

//               {/* View URL Area */}
//               {viewUrl && (
//                 <div className="mt-8 p-4 bg-neutral-900 rounded-xl border border-neutral-700 text-left">
//                   <div className="flex items-center gap-2 text-amber-500 mb-3">
//                     <FaExclamationCircle className="w-4 h-4" />
//                     <span className="text-sm font-medium">This link will expire in 30 seconds</span>
//                   </div>

//                   {file?.type?.includes('image') ? (
//                     <div className="bg-neutral-800 rounded-lg p-2 border border-neutral-700">
//                       <img src={viewUrl} alt="Secure KYC Document" className="max-w-full h-auto rounded" />
//                     </div>
//                   ) : (
//                     <div className="flex flex-col items-center justify-center p-6 bg-neutral-800 rounded-lg border border-neutral-700">
//                       <FaRegFileAlt className="w-12 h-12 text-blue-400 mb-3" />
//                       <a
//                         href={viewUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-400 hover:text-blue-300 underline"
//                       >
//                         Open PDF Document securely
//                       </a>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentVerification;
