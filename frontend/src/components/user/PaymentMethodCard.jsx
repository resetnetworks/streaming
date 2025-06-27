import { FiCreditCard } from 'react-icons/fi';

const PaymentMethodCard = ({ method, onSetDefault }) => {
  // Integrated PaymentMethodIcon component
  const PaymentMethodIcon = ({ type, className = '' }) => {
    const colorClasses = {
      visa: 'text-blue-400',
      mastercard: 'text-purple-400',
      paypal: 'text-blue-500',
      amex: 'text-green-400',
      default: 'text-gray-400'
    };

    return (
      <FiCreditCard className={`${colorClasses[type] || colorClasses.default} ${className} w-5 h-5`} />
    );
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-750 rounded-lg border border-gray-700">
      <div className="flex items-center">
        <PaymentMethodIcon type={method.type} />
        <div className="ml-3">
          <p className="text-gray-300">
            {method.type.charAt(0).toUpperCase() + method.type.slice(1)} •••• {method.last4}
          </p>
          <p className="text-xs text-gray-500">Expires {method.expiry}</p>
        </div>
      </div>
      {method.isDefault ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400">
          Default
        </span>
      ) : (
        <button 
          onClick={() => onSetDefault(method.id)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Set Default
        </button>
      )}
    </div>
  );
};

export default PaymentMethodCard;