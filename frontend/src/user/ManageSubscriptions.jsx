import { useState } from 'react';
import { FiPlus, FiRefreshCw, FiCreditCard, FiSettings } from 'react-icons/fi';
import Modal from '../components/user/Modal';
import AddPaymentMethodModal from '../components/user/AddPaymentMethodModal';
import CancelSubscriptionModal from '../components/user/CancelSubscriptionModal';
import PaymentMethodCard from '../components/user/PaymentMethodCard';
import SubscriptionCard from '../components/user/SubscriptionCard';
import UserHeader from '../components/user/UserHeader';

const ManageSubscriptions = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(null);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  // Demo data
  const subscriptions = [
    {
      id: 'sub_001',
      name: 'Premium Plan',
      price: 19.99,
      interval: 'monthly',
      status: 'active',
      nextBillingDate: '2023-07-15',
      paymentMethod: 'visa',
      cardLast4: '4242',
      features: [
        'Unlimited projects',
        'Advanced analytics',
        'Priority support',
        '100GB storage'
      ]
    },
    {
      id: 'sub_002',
      name: 'Business Plan',
      price: 49.99,
      interval: 'monthly',
      status: 'pending_cancellation',
      nextBillingDate: '2023-07-20',
      paymentMethod: 'mastercard',
      cardLast4: '5555',
      features: [
        'Everything in Premium',
        'Team members (up to 10)',
        'White-labeling',
        'API access'
      ]
    },
    {
      id: 'sub_003',
      name: 'Basic Plan',
      price: 9.99,
      interval: 'monthly',
      status: 'cancelled',
      endDate: '2023-06-30',
      paymentMethod: 'paypal',
      features: [
        '5 projects',
        'Basic analytics',
        'Email support',
        '10GB storage'
      ]
    }
  ];

  const paymentMethods = [
    {
      id: 'pm_001',
      type: 'visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 'pm_002',
      type: 'mastercard',
      last4: '5555',
      expiry: '03/24',
      isDefault: false
    }
  ];

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (activeTab === 'active') return sub.status === 'active' || sub.status === 'pending_cancellation';
    if (activeTab === 'cancelled') return sub.status === 'cancelled';
    return true;
  });

  const handleCancelSubscription = (subscriptionId) => {
    setCancellingSubscription(subscriptionId);
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    // API call would go here
    console.log(`Cancelling subscription ${cancellingSubscription}`);
    setShowCancelModal(false);
    setCancellingSubscription(null);
  };

  const handleReactivate = (subscriptionId) => {
    console.log(`Reactivating subscription ${subscriptionId}`);
  };

  const handleSetDefaultPayment = (paymentMethodId) => {
    console.log(`Setting default payment method ${paymentMethodId}`);
  };

  const handleAddPaymentMethod = () => {
    console.log('Payment method added');
    setShowAddPaymentMethod(false);
  };

  return (
    <div className="min-h-screen bg-image text-gray-100">
        <UserHeader/>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Subscription Management</h1>
            <p className="text-gray-400 mt-1">View and manage your active subscriptions</p>
          </div>
          <button 
            className="mt-4 md:mt-0 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            onClick={() => setShowAddPaymentMethod(true)}
          >
            <FiPlus className="mr-2" /> Add Payment Method
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
            >
              Active Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'cancelled' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
            >
              Cancelled Subscriptions
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscriptions List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredSubscriptions.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
                <FiSettings className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-300">No subscriptions found</h3>
                <p className="mt-1 text-gray-500">
                  {activeTab === 'active' 
                    ? "You don't have any active subscriptions." 
                    : "You haven't cancelled any subscriptions yet."}
                </p>
              </div>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onCancel={handleCancelSubscription}
                  onReactivate={handleReactivate}
                />
              ))
            )}
          </div>

          {/* Payment Methods Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FiCreditCard className="mr-2 text-blue-400" /> Payment Methods
              </h2>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onSetDefault={handleSetDefaultPayment}
                  />
                ))}
              </div>

              <button 
                className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                onClick={() => setShowAddPaymentMethod(true)}
              >
                <FiPlus className="mr-2" /> Add New Payment Method
              </button>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FiRefreshCw className="mr-2 text-blue-400" /> Billing History
                </h2>
                <p className="text-gray-400 text-sm">
                  View and download your past invoices and receipts.
                </p>
                <button className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-transparent border border-gray-600 hover:border-gray-500 rounded-lg text-gray-300 transition-colors">
                  View Billing History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancellation}
        subscriptionName={subscriptions.find(s => s.id === cancellingSubscription)?.name || ''}
      />

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddPaymentMethod}
        onClose={() => setShowAddPaymentMethod(false)}
        onAdd={handleAddPaymentMethod}
      />
    </div>
  );
};

export default ManageSubscriptions;