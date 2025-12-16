import UploadForm from "../../components/artist/upload/UploadForm";

const SingleUpload = ({ onCancel }) => {
  const handleSubmit = (formData) => {
    console.log("Uploading song:", formData);
  };
 return (
    <div className="p-6">
      <UploadForm 
        type="song"
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default SingleUpload;
