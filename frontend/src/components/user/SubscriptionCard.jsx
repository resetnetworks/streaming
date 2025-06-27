import { FiCheckCircle, FiXCircle, FiClock, FiCreditCard } from 'react-icons/fi';
import StatusBadge from './StatusBadge';

const SubscriptionCard = ({ subscription, onCancel, onReactivate }) => {
  // PaymentMethodIcon component integrated directly
  const PaymentMethodIcon = ({ type, className = '' }) => {
    const colorClasses = {
      visa: 'text-blue-400',
      mastercard: 'text-purple-400',
      paypal: 'text-blue-500',
      default: 'text-gray-400'
    };

    return (
      <FiCreditCard className={`${colorClasses[type] || colorClasses.default} ${className}`} />
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">{subscription.name}</h2>
            <StatusBadge status={subscription.status} className="ml-3" />
          </div>
          <p className="mt-1 text-gray-400">
            ${subscription.price}/{subscription.interval}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          {subscription.status === 'active' && (
            <button
              onClick={() => onCancel(subscription.id)}
              className="px-4 py-2 bg-transparent border border-red-600 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              Cancel Subscription
            </button>
          )}
          {subscription.status === 'pending_cancellation' && (
            <button
              onClick={() => onReactivate(subscription.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 mb-3">PLAN DETAILS</h3>
        <ul className="space-y-2">
          {subscription.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-green-400 mt-0.5 mr-2" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">PAYMENT METHOD</h3>
          <div className="flex items-center">
            <PaymentMethodIcon type={subscription.paymentMethod} className="mr-2" />
            <span className="text-gray-300">
              {subscription.paymentMethod === 'paypal' 
                ? 'PayPal' 
                : `${subscription.paymentMethod.charAt(0).toUpperCase() + subscription.paymentMethod.slice(1)} •••• ${subscription.cardLast4}`}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            {subscription.status === 'cancelled' ? 'ENDED ON' : 'NEXT BILLING DATE'}
          </h3>
          <p className="text-gray-300">
            {new Date(subscription.status === 'cancelled' ? subscription.endDate : subscription.nextBillingDate).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;