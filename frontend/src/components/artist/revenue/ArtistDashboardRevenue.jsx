// src/components/artistDashboard/ArtistDashboardRevenue.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getArtistBalance,
  getArtistLedger,
  getArtistPayouts,
  requestPayout,
  resetPayoutRequest
} from '../../../features/artistDashboard/artistRevenueSlice';
import {
  MdAccountBalanceWallet,
  MdPayments,
  MdHistory,
  MdDownload,
  MdCalendarToday,
  MdFilterList,
  MdRefresh,
  MdCheckCircle,
  MdError,
  MdArrowUpward,
  MdArrowDownward,
  MdAttachMoney,
  MdEmail,
  MdClose,
  MdInfo,
  MdTrendingUp,
  MdTrendingDown
} from 'react-icons/md';
import { FaPaypal } from 'react-icons/fa';

const ArtistDashboardRevenue = () => {
  const dispatch = useDispatch();
  const {
    balance,
    ledger,
    payouts,
    payoutRequest
  } = useSelector((state) => state.artistRevenue);

  // State for payout request modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  
  // State for ledger filters
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerType, setLedgerType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

 // Currency formatter - Always show in USD with $ symbol
const formatCurrency = (amount) => {
  const numericAmount = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
};

  // Date formatter
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch initial data
  useEffect(() => {
    dispatch(getArtistBalance());
    dispatch(getArtistLedger({ page: ledgerPage, limit: 20 }));
    dispatch(getArtistPayouts());
  }, [dispatch, ledgerPage]);

  // Handle successful payout request
  useEffect(() => {
    if (payoutRequest.success) {
      setShowPayoutModal(false);
      setPayoutAmount('');
      setPaypalEmail('');
      dispatch(getArtistBalance());
      dispatch(getArtistPayouts());
      setTimeout(() => dispatch(resetPayoutRequest()), 3000);
    }
  }, [payoutRequest.success, dispatch]);

  // Handle payout request submission
  const handlePayoutRequest = (e) => {
    e.preventDefault();
    if (!payoutAmount || !paypalEmail) {
      alert('Please fill in all fields');
      return;
    }
    
    const amount = parseFloat(payoutAmount);
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    if (balance.data?.availableBalance && amount > balance.data.availableBalance) {
      alert('Amount exceeds available balance');
      return;
    }
    
    dispatch(requestPayout({ amount, paypalEmail }));
  };

  // Handle ledger filter changes
  const handleFilterChange = () => {
    dispatch(getArtistLedger({ 
      page: 1, 
      limit: 20,
      type: ledgerType === 'all' ? undefined : ledgerType,
      startDate: dateRange.start,
      endDate: dateRange.end
    }));
    setLedgerPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setLedgerType('all');
    setDateRange({ start: '', end: '' });
    dispatch(getArtistLedger({ page: 1, limit: 20 }));
    setLedgerPage(1);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Success/Error Messages */}
      {payoutRequest.success && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
          <MdCheckCircle className="text-green-500 text-xl" />
          <span className="text-green-400">Payout request submitted successfully!</span>
        </div>
      )}
      
      {payoutRequest.error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <MdError className="text-red-500 text-xl" />
          <span className="text-red-400">{payoutRequest.error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Revenue Dashboard</h1>
        <button
          onClick={() => {
            dispatch(getArtistBalance());
            dispatch(getArtistLedger({ page: ledgerPage, limit: 20 }));
            dispatch(getArtistPayouts());
          }}
          className="flex items-center gap-2 text-gray-200 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <MdRefresh className={balance.loading || ledger.loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Available Balance Card */}
        <div className="relative p-5 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
          <div className="absolute top-4 right-4">
            <MdAccountBalanceWallet className="text-2xl text-blue-500" />
          </div>
          <div className="mb-2">
            <div className="text-gray-400 text-sm">Available Balance</div>
            <div className="text-2xl md:text-3xl font-bold text-white">
              {balance.loading ? '...' : formatCurrency(balance.data?.availableBalance || 0)}
            </div>
          </div>
          <div className="text-sm text-green-400 flex items-center gap-1">
            <MdTrendingUp />
            Ready for payout
          </div>
        </div>

        {/* Total Earned Card */}
        <div className="relative p-5 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
          <div className="absolute top-4 right-4">
            <MdTrendingUp className="text-2xl text-green-500" />
          </div>
          <div className="mb-2">
            <div className="text-gray-400 text-sm">Total Earned</div>
            <div className="text-2xl md:text-3xl font-bold text-white">
              {balance.loading ? '...' : formatCurrency(balance.data?.totalEarned || 0)}
            </div>
          </div>
          <div className="text-sm text-blue-400">Lifetime earnings</div>
        </div>

        {/* Total Paid Out Card */}
        <div className="relative p-5 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
          <div className="absolute top-4 right-4">
            <MdPayments className="text-2xl text-purple-500" />
          </div>
          <div className="mb-2">
            <div className="text-gray-400 text-sm">Total Paid Out</div>
            <div className="text-2xl md:text-3xl font-bold text-white">
              {balance.loading ? '...' : formatCurrency(balance.data?.totalPaidOut || 0)}
            </div>
          </div>
          <div className="text-sm text-purple-400">Processed payments</div>
        </div>

        {/* Payout Action Card */}
        <div className="relative p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-800/30">
          <div className="absolute top-4 right-4">
            <MdDownload className="text-2xl text-blue-400" />
          </div>
          <div className="mb-4">
            <div className="text-gray-300 text-sm">Request Payout</div>
            <div className="text-lg font-semibold text-white">Withdraw Funds</div>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={!balance.data?.availableBalance || balance.data?.availableBalance <= 0}
            className={`w-full py-2 px-4 rounded-lg flex text-white items-center justify-center gap-2 transition-colors ${
              !balance.data?.availableBalance || balance.data?.availableBalance <= 0
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FaPaypal />
            Request Payout
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {/* <div className="mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MdFilterList />
            Transaction Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Transaction Type</label>
            <select
              value={ledgerType}
              onChange={(e) => setLedgerType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="royalty">Royalties</option>
              <option value="payout">Payouts</option>
              <option value="refund">Refunds</option>
              <option value="adjustment">Adjustments</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleFilterChange}
          disabled={ledger.loading}
          className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {ledger.loading ? 'Applying...' : 'Apply Filters'}
        </button>
      </div> */}

      {/* Ledger and Payouts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Ledger */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MdHistory />
              Transaction Ledger
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {ledger.loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : ledger.error ? (
              <div className="p-4 text-center text-red-400">
                <MdError className="inline-block text-xl mb-2" />
                <p>{ledger.error}</p>
              </div>
            ) : ledger.items.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No transactions found
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Description</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="p-4 text-gray-300">{formatDate(item.createdAt)}</td>
                      <td className="p-4">
                        <div className="text-white">{item.description}</div>
                        <div className="text-sm text-gray-400">{item.reference}</div>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center gap-1 ${
                          item.type === 'credit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {item.type === 'credit' ? <MdArrowUpward /> : <MdArrowDownward />}
                          {formatCurrency(item.amountUSD )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.type === 'credit' 
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {ledger.items.length > 0 && (
            <div className="p-4 border-t border-gray-800 flex justify-between items-center">
              <button
                onClick={() => setLedgerPage(prev => Math.max(1, prev - 1))}
                disabled={ledgerPage === 1 || ledger.loading}
                className="px-4 py-2 text-gray-100 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400">Page {ledgerPage}</span>
              <button
                onClick={() => setLedgerPage(prev => prev + 1)}
                disabled={ledger.loading || ledger.items.length < 20}
                className="px-4 py-2 text-gray-100 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MdPayments />
              Payout History
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {payouts.loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : payouts.error ? (
              <div className="p-4 text-center text-red-400">
                <MdError className="inline-block text-xl mb-2" />
                <p>{payouts.error}</p>
              </div>
            ) : payouts.items.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No payout history available
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.items.map((payout, index) => (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="p-4 text-gray-300">{formatDate(payout.createdAt)}</td>
                      <td className="p-4 text-white font-medium">{formatCurrency(payout.amount)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payout.status === 'paid' 
                            ? 'bg-green-900/30 text-green-400'
                            : payout.status === 'requested'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaPaypal className="text-blue-500" />
                          <span className="text-gray-300">{payout.paymentMethod}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md">
            <div className="p-6 border-b border-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Request Payout</h3>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handlePayoutRequest} className="p-6">
              {/* Available Balance Info */}
              <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <MdInfo className="text-blue-400" />
                  <span className="text-blue-400 text-sm">Available Balance</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(balance.data?.availableBalance || 0)}
                </div>
              </div>
              
              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Amount to Withdraw</label>
                <div className="relative">
                  <MdAttachMoney className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    max={balance.data?.availableBalance || 0}
                    step="0.01"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Minimum withdrawal: {formatCurrency(1)}
                </div>
              </div>
              
              {/* PayPal Email Input */}
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">PayPal Email Address</label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="your-email@paypal.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              

              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-3 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutRequest.loading || !payoutAmount || !paypalEmail}
                  className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {payoutRequest.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    'Request Payout'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDashboardRevenue;