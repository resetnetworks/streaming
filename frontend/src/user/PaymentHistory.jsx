import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPurchaseHistory,
  selectDashboardLoading,
  selectDashboardError,
} from '../features/payments/paymentSelectors';
import { fetchUserPurchases } from '../features/payments/userPaymentSlice';
import {
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiCheckCircle,
} from 'react-icons/fi';
import UserHeader from '../components/user/UserHeader';

const PaymentHistory = () => {
  const dispatch = useDispatch();
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const songs = useSelector((state) => state.songs.allSongs);
  const albums = useSelector((state) => state.albums.allAlbums);
  const payments = useSelector(selectPurchaseHistory);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  useEffect(() => {
    dispatch(fetchUserPurchases());
  }, [dispatch]);

  const toggleExpand = (id) => {
    setExpandedPayment(expandedPayment === id ? null : id);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const resolveItemName = useCallback(
    (payment) => {
      if (payment.itemType === 'song') {
        return songs?.find((s) => s._id === payment.itemId)?.title || 'Unknown Song';
      }
      if (payment.itemType === 'album') {
        return albums?.find((a) => a._id === payment.itemId)?.title || 'Unknown Album';
      }
      if (payment.itemType === 'artist-subscription') {
        return payment.artistName || 'Unknown Artist'; // ✅ Now directly available from backend
      }
      return 'Unknown Item';
    },
    [songs, albums]
  );

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const name = resolveItemName(payment) || '';
      const itemName = name.toLowerCase();
      const paymentId = payment.paymentId?.toLowerCase() || '';
      const matchesSearch =
        itemName.includes(searchTerm.toLowerCase()) ||
        paymentId.includes(searchTerm.toLowerCase());

      return filter === 'all' && matchesSearch;
    });
  }, [payments, resolveItemName, searchTerm, filter]);

  return (
    <div className="min-h-screen bg-image text-white">
      <UserHeader />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Payment History</h1>

        <div className="bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-700">
          {/* Search + Filter */}
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
                <option value="all">All Types</option>
              </select>
            </div>
          </div>

          {/* Payment States */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading payment history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No payments found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800 hover:bg-gray-750 transition-colors"
                >
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer transition-colors"
                    onClick={() => toggleExpand(payment._id)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-900/30 text-green-400 mr-4">
                        <FiCheckCircle className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {resolveItemName(payment)}
                        </h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <FiCalendar className="mr-1" />
                          <span className="mr-3">{formatDate(payment.purchasedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-4 text-white">₹{payment.price}</span>
                      {expandedPayment === payment._id ? (
                        <FiChevronUp className="text-gray-400" />
                      ) : (
                        <FiChevronDown className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {expandedPayment === payment._id && (
                    <div className="border-t border-gray-700 p-4 bg-gray-750">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Payment ID</h4>
                          <p className="text-white">{payment.paymentId}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Item Type</h4>
                          <p className="text-white capitalize">{payment.itemType}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Item Name</h4>
                          <p className="text-white">{resolveItemName(payment)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Amount</h4>
                          <p className="font-medium text-white">₹{payment.price}</p>
                        </div>
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
