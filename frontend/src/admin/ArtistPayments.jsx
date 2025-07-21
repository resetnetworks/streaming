// src/pages/ArtistPayments.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  fetchArtistTransactions,
  fetchArtistRevenue,
  fetchSubscriberCount,
} from '../features/payments/adminPaymentSlice';

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

  // Filter only paid transactions
  const paidTransactions = transactions?.filter((txn) => txn.status === 'paid') || [];

  // Calculate artist and platform revenue
  const platformCut = 0.15;
  const artistCut = 0.85;

  const platformRevenueFromTransactions = paidTransactions.reduce(
    (sum, txn) => sum + txn.amount * platformCut,
    0
  );

  const artistRevenueFromTransactions = paidTransactions.reduce(
    (sum, txn) => sum + txn.amount * artistCut,
    0
  );

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
                ₹{artistRevenueFromTransactions.toFixed(2)}
              </p>
            </div>

            {/* Platform Revenue */}
            <div className="bg-slate-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-slate-400">Platform Revenue (15%)</p>
              <p className="text-xl font-bold text-yellow-400">
                ₹{platformRevenueFromTransactions.toFixed(2)}
              </p>
            </div>

            {/* Subscribers */}
            <div className="bg-slate-800 rounded-xl shadow-md p-4">
              <p className="text-sm text-slate-400">Active Subscribers</p>
              <p className="text-xl font-bold text-blue-400">{subscriberCount ?? 0}</p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-slate-800 rounded-xl shadow-md p-4 mb-8">
            <p className="text-sm text-slate-400 mb-2">Revenue Breakdown</p>
            <ul className="text-xs space-y-1">
              <li>Songs: ₹{revenueBreakdown.songRevenue?.toFixed(2) || '0.00'}</li>
              <li>Albums: ₹{revenueBreakdown.albumRevenue?.toFixed(2) || '0.00'}</li>
              <li>Subscriptions: ₹{revenueBreakdown.subscriptionRevenue?.toFixed(2) || '0.00'}</li>
              <li className="mt-2 text-slate-300 font-medium">
                Total Revenue (100%): ₹{totalRevenue?.toFixed(2) || '0.00'}
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
                      const fee = txn.amount * platformCut;
                      return (
                        <tr key={txn._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                          <td className="px-4 py-2">{txn.itemType}</td>
                          <td className="px-4 py-2">{txn.itemId || '-'}</td>
                          <td className="px-4 py-2">₹{txn.amount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-yellow-400">₹{fee.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 rounded text-xs bg-green-500 text-white">
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
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
