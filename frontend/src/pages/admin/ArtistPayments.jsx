// src/pages/ArtistPayments.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  fetchArtistTransactions,
  fetchArtistRevenue,
  fetchSubscriberCount,
} from '../../features/payments/adminPaymentSlice';
import { SiVelog } from 'react-icons/si';

const ArtistPayments = () => {
  const dispatch = useDispatch();
  const { artistId } = useParams();

  const {
    transactions,
    revenueBreakdown,
    subscriberCount,
    totalRevenue,
    loading,
    error,
  } = useSelector((state) => state.artistDashboard);

  useEffect(() => {
    if (!artistId) return;
    dispatch(fetchArtistTransactions({ artistId }));
    dispatch(fetchArtistRevenue(artistId));
    dispatch(fetchSubscriberCount(artistId));
  }, [dispatch, artistId]);

  // ✅ Safe filter with null checks
  const paidTransactions = transactions?.filter((txn) => 
    txn && txn.status === 'paid'
  ) || [];

  // Calculate artist and platform revenue
  const platformCut = 0.15;
  const artistCut = 0.85;

  // ✅ Safe calculation with null checks and default values
  const platformRevenueFromTransactions = paidTransactions.reduce(
    (sum, txn) => {
      // ✅ Check if txn and txn.amount exist and are valid numbers
      const amount = (txn && typeof txn.amountInUSD === 'number') ? txn.amountInUSD : 0;
      return sum + (amount * platformCut);
    },
    0
  );

  const artistRevenueFromTransactions = paidTransactions.reduce(
    (sum, txn) => {
      // ✅ Check if txn and txn.amount exist and are valid numbers
      const amount = (txn && typeof txn.amountInUSD === 'number') ? txn.amountInUSD : 0;
      return sum + (amount * artistCut);
    },
    0
  );

  // ✅ Safe formatting helper function
  const safeFormatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    return Number(value).toFixed(2);
  };

  // ✅ Safe number conversion helper
  const safeNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 0;
    }
    return Number(value);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Dashboard</h1>

      {loading && <p className="text-blue-400">Loading data…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Artist Revenue */}
            <div className="bg-slate-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-slate-400">Artist Revenue (85%)</p>
              <p className="text-xl font-bold text-green-400">
                ${safeFormatCurrency(artistRevenueFromTransactions)}
              </p>
            </div>

            {/* Platform Revenue */}
            <div className="bg-slate-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-slate-400">Platform Revenue (15%)</p>
              <p className="text-xl font-bold text-yellow-400">
                ${safeFormatCurrency(platformRevenueFromTransactions)}
              </p>
            </div>

            {/* Subscribers */}
            <div className="bg-slate-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-slate-400">Active Subscribers</p>
              <p className="text-xl font-bold text-blue-400">
                {safeNumber(subscriberCount)}
              </p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-slate-800 rounded-xl shadow-md p-4 mb-8">
            <p className="text-sm text-slate-400 mb-2">Revenue Breakdown</p>
            <ul className="text-xs space-y-1">
              <li>
                Songs: ${safeFormatCurrency(revenueBreakdown?.songRevenue)}
              </li>
              <li>
                Albums: ${safeFormatCurrency(revenueBreakdown?.albumRevenue)}
              </li>
              <li>
                Subscriptions: ${safeFormatCurrency(revenueBreakdown?.subscriptionRevenue)}
              </li>
              <li className="mt-2 text-slate-300 font-medium">
                Total Revenue (100%): ${safeFormatCurrency(totalRevenue)}
              </li>
            </ul>
          </div>

          {/* Transactions Table */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Transactions</h2>
            <div className="overflow-x-auto bg-slate-800 rounded-xl shadow-md">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-700 border-b border-slate-600">
                  <tr>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Platform Fee (15%)</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paidTransactions.length ? (
                    paidTransactions.map((txn) => {
                      // ✅ Safe calculation with null checks
                      if (!txn || !txn._id) return null;
                      
                      const amount = safeNumber(txn.amountInUSD);
                      const fee = amount * platformCut;
                      
                      return (
                        <tr key={txn._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                          <td className="px-4 py-2">{txn.itemType || '-'}</td>
                          <td className="px-4 py-2">{txn.itemId || '-'}</td>
                          <td className="px-4 py-2">${safeFormatCurrency(amount)}</td>
                          <td className="px-4 py-2 text-yellow-400">
                            ${safeFormatCurrency(fee)}
                          </td>
                          <td className="px-4 py-2">
                            {txn.createdAt ? 
                              new Date(txn.createdAt).toLocaleDateString() : 
                              '-'
                            }
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 rounded text-xs bg-green-500 text-white">
                              {txn.status || 'unknown'}
                            </span>
                          </td>
                        </tr>
                      );
                    }).filter(Boolean) // ✅ Remove any null entries
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-4 text-slate-400">
                        No paid transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ArtistPayments;
