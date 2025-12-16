import UploadForm from "../../components/artist/upload/UploadForm";

const AlbumUpload = ({ onCancel }) => {
  const handleSubmit = (formData) => {
    console.log("Uploading song:", formData);
  };
 return (
    <div className="p-6">
      <UploadForm 
        type="album"
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AlbumUpload;
