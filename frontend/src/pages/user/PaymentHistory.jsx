import { useState, useMemo, useCallback } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiCheckCircle,
} from 'react-icons/fi';
import UserHeader from '../../components/user/UserHeader';
import { useUserPurchases } from '../../hooks/api/useUserDashboard';

const PaymentHistory = () => {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const { data, isLoading, isError, error } = useUserPurchases();
  const songs = data?.songs || [];
  const albums = data?.albums || [];
  const history = data?.history || [];


  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // Currency symbol mapping
  const getCurrencySymbol = useCallback((currency) => {
    const symbols = {
      USD: '$',
      GBP: '£',
      JPY: '¥',
      INR: '₹',
      EUR: '€'
    };
    return symbols[currency] || currency;
  }, []);

  // Format price with currency symbol
  const formatPrice = useCallback((price, currency) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${price}`;
  }, [getCurrencySymbol]);

 const resolveName = useCallback(
  (p) => {
    if (p.itemType === 'song')
      return songs.find((s) => s._id === p.itemId)?.title || 'Song';

    if (p.itemType === 'album')
      return albums.find((a) => a._id === p.itemId)?.title || 'Album';

    return 'Artist';
  },
  [songs, albums]
);


  const filtered = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt)
    );

    return sorted.filter((p) => {
      const name = resolveName(p).toLowerCase();
      const q = search.toLowerCase();

      const matchSearch =
  name.includes(q) || p.paymentId.toLowerCase().includes(q);


      const matchType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'subscription'
          ? p.itemType === 'artist-subscription'
          : p.itemType === typeFilter;

      return matchSearch && matchType;
    });
  }, [history, resolveName, search, typeFilter]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <UserHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Payment History</h1>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          {/* Search / Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <FiFilter className="text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="song">Songs</option>
                <option value="album">Albums</option>
                <option value="subscription">Subscriptions</option>
              </select>
            </div>
          </div>

          {/* States */}
          {isLoading && (
            <p className="text-center py-12 text-slate-400">Loading…</p>
          )}
          {error && (
            <p className="text-center py-12 text-red-400">{error}</p>
          )}
          {!isLoading && !error && filtered.length === 0 && (
            <p className="text-center py-12 text-slate-400">
              No payments found
            </p>
          )}

          {/* List */}
          {!isLoading && !error && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((p) => (
                <div
                  key={`${p.itemId}-${p.purchasedAt}`}
                  className="border border-slate-700 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 transition"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => toggle(`${p.itemId}-${p.purchasedAt}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-blue-900/40 flex items-center justify-center">
                        <FiCheckCircle className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {resolveName(p)}
                        </p>
                        <p className="text-xs text-slate-400">
                          <FiCalendar className="inline mr-1" />
                          {formatDate(p.purchasedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">
                        {formatPrice(p.amount, p.currency)}
                      </span>
                      {expanded === `${p.itemId}-${p.purchasedAt}` ? (
                        <FiChevronUp className="text-slate-400" />
                      ) : (
                        <FiChevronDown className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expanded === `${p.itemId}-${p.purchasedAt}` && (
                    <div className="border-t border-slate-700 px-4 pb-4 pt-3 text-xs grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <span className="text-slate-400">Type</span>
                        <p className="capitalize text-slate-200">
                          {p.itemType.replace('-', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Item</span>
                        <p className="text-slate-200">{resolveName(p)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Amount</span>
                        <p className="text-slate-200">{formatPrice(p.amount, p.currency)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Currency</span>
                        <p className="text-slate-200 uppercase">{p.currency}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentHistory;
