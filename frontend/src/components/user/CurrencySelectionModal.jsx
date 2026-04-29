// src/components/user/CurrencySelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { MdClose, MdAlbum } from 'react-icons/md';
import { FaMusic, FaLock } from 'react-icons/fa';

// ─── 5 fixed currencies ────────────────────────────────────────────────────────
const CURRENCIES = [
  { currency: 'USD', symbol: '$',  name: 'US Dollar'    },
  { currency: 'EUR', symbol: '€',  name: 'Euro'          },
  { currency: 'GBP', symbol: '£',  name: 'British Pound' },
  { currency: 'JPY', symbol: '¥',  name: 'Japanese Yen'  },
  { currency: 'INR', symbol: '₹',  name: 'Indian Rupee'  },
];

const CURRENCY_MAP = Object.fromEntries(CURRENCIES.map((c) => [c.currency, c]));

const formatAmount = (amount) => {
  const n = Number(amount);
  if (!n) return '0';
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

// ─── Currency row — identical to SubscriptionMethodModal & PaymentMethodModal ──
const CurrencyRow = ({ currency, symbol, name, amount, isBase, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between gap-3 px-4 py-3.5
      bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-500
      rounded-xl transition-all duration-200 group text-left"
  >
    {/* Left: symbol badge + currency info */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-700 border border-gray-600
        flex items-center justify-center">
        <span className="text-base font-bold text-white">{symbol}</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{currency}</span>
          {isBase && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded
              bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 leading-none">
              Base
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-0.5 truncate">{name}</div>
      </div>
    </div>

    {/* Right: price + label + arrow */}
    <div className="flex items-center gap-3 flex-shrink-0">
      <div className="text-right">
        <div className="text-base font-bold text-white">
          {symbol}{formatAmount(amount)}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">one-time purchase</div>
      </div>
      <span className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5
        transition-all duration-200 text-sm">
        →
      </span>
    </div>
  </button>
);

// ─── Main component ────────────────────────────────────────────────────────────
const CurrencySelectionModal = ({
  open,
  onClose,
  onSelectCurrency,
  item,
  itemType,
  title,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const t = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open && !isVisible) return null;
  if (open && !item) return null;

  // Build available prices: match item data to our 5 fixed currencies only
  const getAmountForCurrency = (currency) => {
    if (item?.basePrice?.currency === currency) {
      return { amount: item.basePrice.amount, isBase: true };
    }
    const converted = item?.convertedPrices?.find((p) => p.currency === currency);
    if (converted) return { amount: converted.amount, isBase: false };
    // Fallback for USD if no basePrice set
    if (currency === 'USD' && item?.price) return { amount: item.price, isBase: true };
    return null;
  };

  const availablePrices = CURRENCIES
    .map((c) => {
      const priceData = getAmountForCurrency(c.currency);
      if (!priceData) return null;
      return { ...c, amount: priceData.amount, isBase: priceData.isBase };
    })
    .filter(Boolean);

  const isAlbum       = itemType === 'album';
  const IconComponent = isAlbum ? MdAlbum : FaMusic;
  const iconColor     = isAlbum ? 'text-blue-400' : 'text-green-400';
  const purchaseType  = isAlbum ? 'Album Purchase' : 'Song Purchase';
  const itemTitle     = item?.title || `Unknown ${itemType || 'item'}`;
  const itemSubtitle  = isAlbum
    ? (item?.artist?.name || 'Various Artists')
    : (item?.album?.title || item?.artist?.name || 'Unknown Artist');

  const benefits = isAlbum
    ? ['Lifetime access to album', 'High-quality audio download', 'Secure payment processing', 'Support the artist directly']
    : ['Lifetime access to song',  'High-quality audio download', 'Secure payment processing', 'Support the artist directly'];

  // No currencies available fallback
  if (open && !availablePrices.length) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300
        ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/75" onClick={onClose} />
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white
          rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <IconComponent className={`w-4 h-4 ${iconColor}`} />
              Select Currency
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-700 transition-colors">
              <MdClose className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">No currency options available for this {itemType || 'item'}.</p>
            <button onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300
      ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 text-white
        rounded-2xl shadow-2xl w-full mx-4 border border-gray-700
        transition-transform duration-300 ${open ? 'scale-100' : 'scale-95'}
        max-w-md max-h-[90vh] overflow-y-auto flex flex-col`}
      >
        <div className="p-5 sm:p-6 flex flex-col gap-5">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700
                flex items-center justify-center shrink-0">
                <img src={`${window.location.origin}/icon.png`} alt="logo"
                  className="w-5 h-5 object-contain" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white">
                {title || 'Select Currency'}
              </h2>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-700 transition-colors shrink-0">
              <MdClose className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* ── Item info card ── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <IconComponent className={`w-3 h-3 ${iconColor} shrink-0`} />
              <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
                {purchaseType}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{itemTitle}</p>
                <p className="text-xs text-gray-400 mt-0.5">{itemSubtitle}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Choose your preferred currency for purchase
            </p>
          </div>

          {/* ── Currency list ── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Available Currencies
              </h3>
              <span className="text-xs text-gray-500">{availablePrices.length} options</span>
            </div>
            <div className="flex flex-col gap-2">
              {availablePrices.map((price) => (
                <CurrencyRow
                  key={price.currency}
                  currency={price.currency}
                  symbol={price.symbol}
                  name={price.name}
                  amount={price.amount}
                  isBase={price.isBase}
                  onClick={() => onSelectCurrency({
                    currency: price.currency,
                    amount: price.amount,
                    symbol: price.symbol,
                    isBaseCurrency: price.isBase,
                  })}
                />
              ))}
            </div>
          </div>

          {/* ── Security note ── */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-700/50
            text-xs text-gray-500">
            <FaLock className="w-3 h-3 shrink-0" />
            <span>Secure & encrypted payment processing</span>
          </div>

          {/* ── Cancel ── */}
          <button onClick={onClose}
            className="w-full py-2.5 border border-gray-700 text-gray-400
              hover:bg-gray-800 hover:text-gray-300 rounded-xl transition-colors
              duration-200 font-medium text-sm">
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
};

export default CurrencySelectionModal;