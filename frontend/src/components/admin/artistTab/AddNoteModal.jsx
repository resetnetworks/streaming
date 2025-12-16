import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSync, FaTimes } from 'react-icons/fa';

import { addAdminNote } from '../../../features/admin/artistApplicationAdminSlice';
import { selectNoteLoading } from '../../../features/admin/artistApplicationAdminSelectors';

const AddNoteModal = ({ applicationId, isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [note, setNote] = useState('');
  const noteLoading = useSelector(selectNoteLoading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicationId || !note.trim()) return;
    
    const result = await dispatch(addAdminNote({
      applicationId,
      note: note.trim()
    }));
    
    if (result.type === 'artistApplicationAdmin/addNote/fulfilled') {
      setNote('');
      onSuccess && onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-2">Add Admin Note</h3>
        <p className="text-gray-400 text-sm mb-6">
          Add a note for application #{applicationId?.slice(-8)}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Note Content
                <span className="text-red-400 ml-1">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="4"
                placeholder="Enter your note here..."
                required
                disabled={noteLoading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                This note will be visible in the application history.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
              disabled={noteLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!note.trim() || noteLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {noteLoading ? (
                <>
                  <FaSync className="animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;