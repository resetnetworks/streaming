import { FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';

const CancelSubscriptionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  subscriptionName 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Subscription">
      <div className="mb-6">
        <div className="flex items-start">
          <FiAlertTriangle className="flex-shrink-0 h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
          <p className="text-gray-300">
            Are you sure you want to cancel your {subscriptionName} subscription? 
            You'll lose access to premium features at the end of your billing period.
          </p>
        </div>
        
        <div className="mt-4 p-4 bg-gray-750 rounded-lg border border-gray-700">
          <h4 className="font-medium text-gray-300 mb-2">What you'll lose:</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start">
              <FiXCircle className="flex-shrink-0 h-4 w-4 text-red-400 mt-0.5 mr-2" />
              <span>Access to premium features</span>
            </li>
            <li className="flex items-start">
              <FiXCircle className="flex-shrink-0 h-4 w-4 text-red-400 mt-0.5 mr-2" />
              <span>Priority customer support</span>
            </li>
            <li className="flex items-start">
              <FiXCircle className="flex-shrink-0 h-4 w-4 text-red-400 mt-0.5 mr-2" />
              <span>Advanced analytics</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Confirm Cancellation
        </button>
      </div>
    </Modal>
  );
};

export default CancelSubscriptionModal;