import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFilter, FiSearch, FiCreditCard, FiDollarSign, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import UserHeader from '../components/user/UserHeader';

const PaymentHistory = () => {
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const toggleExpand = (id) => {
    setExpandedPayment(expandedPayment === id ? null : id);
  };

  // Demo data
  const payments = [
    {
      id: 1,
      date: '2023-05-15',
      amount: 129.99,
      status: 'completed',
      method: 'credit_card',
      description: 'Premium Subscription',
      reference: 'INV-2023-05-001',
      cardLast4: '4242',
    },
    {
      id: 2,
      date: '2023-04-28',
      amount: 49.99,
      status: 'completed',
      method: 'paypal',
      description: 'Service Upgrade',
      reference: 'INV-2023-04-015',
    },
    {
      id: 3,
      date: '2023-04-10',
      amount: 29.99,
      status: 'refunded',
      method: 'credit_card',
      description: 'Basic Subscription',
      reference: 'INV-2023-04-008',
      cardLast4: '1881',
    },
    {
      id: 4,
      date: '2023-03-22',
      amount: 99.99,
      status: 'failed',
      method: 'bank_transfer',
      description: 'Annual Plan',
      reference: 'INV-2023-03-022',
    },
    {
      id: 5,
      date: '2023-03-05',
      amount: 19.99,
      status: 'completed',
      method: 'credit_card',
      description: 'Add-on Service',
      reference: 'INV-2023-03-005',
      cardLast4: '5555',
    },
  ];

  const filteredPayments = payments
    .filter(payment => {
      const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || payment.status === filter;
      return matchesSearch && matchesFilter;
    });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 text-green-400';
      case 'refunded':
        return 'bg-blue-900/30 text-blue-400';
      case 'failed':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <FiCreditCard className="mr-2 text-gray-400" />;
      case 'paypal':
        return <FiDollarSign className="mr-2 text-gray-400" />;
      case 'bank_transfer':
        return <FiCreditCard className="mr-2 text-gray-400" />;
      default:
        return <FiCreditCard className="mr-2 text-gray-400" />;
    }
  };

  return (
  
    <div className="min-h-screen bg-image text-white">
        <UserHeader/>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Payment History</h1>
        
        <div className="bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400" />
              <select
                className="border border-gray-700 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No payments found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800 hover:bg-gray-750 transition-colors">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer transition-colors"
                    onClick={() => toggleExpand(payment.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(payment.status)} mr-4`}>
                        {payment.status === 'completed' && <FiCheckCircle className="text-lg" />}
                        {payment.status === 'refunded' && <FiCheckCircle className="text-lg" />}
                        {payment.status === 'failed' && <FiCheckCircle className="text-lg" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{payment.description}</h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <FiCalendar className="mr-1" />
                          <span className="mr-3">{formatDate(payment.date)}</span>
                          {getMethodIcon(payment.method)}
                          <span className="capitalize text-gray-400">{payment.method.replace('_', ' ')}</span>
                          {payment.cardLast4 && <span className="ml-2 text-gray-500">•••• {payment.cardLast4}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`font-semibold mr-4 ${payment.status === 'refunded' ? 'text-blue-400' : 'text-white'}`}>
                        ${payment.amount.toFixed(2)}
                      </span>
                      {expandedPayment === payment.id ? (
                        <FiChevronUp className="text-gray-400" />
                      ) : (
                        <FiChevronDown className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedPayment === payment.id && (
                    <div className="border-t border-gray-700 p-4 bg-gray-750">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Reference</h4>
                          <p className="text-white">{payment.reference}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Status</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Payment Method</h4>
                          <div className="flex items-center text-white">
                            {getMethodIcon(payment.method)}
                            <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                            {payment.cardLast4 && <span className="ml-2 text-gray-500">•••• {payment.cardLast4}</span>}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Amount</h4>
                          <p className={`font-medium ${payment.status === 'refunded' ? 'text-blue-400' : 'text-white'}`}>
                            ${payment.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;