import React, { useCallback, useState } from "react";
import { MdAccessTimeFilled } from "react-icons/md";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import { RiPlayFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { toggleLikeSong } from "../../features/auth/authSlice";
import { selectLikedSongIds } from "../../features/auth/authSelectors";
import { formatDuration } from "../../utills/helperFunctions";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import CurrencySelectionModal from "./CurrencySelectionModal";

const btnBase =
  "action-button inline-flex items-center justify-center text-[10px] sm:text-xs h-7 w-[96px] px-2.5 rounded font-semibold leading-[14px] whitespace-nowrap disabled:bg-gray-600 transition-colors";

const AccessChip = ({
  song,
  purchased,
  alreadySubscribed,
  onSubscribeRequired,
  onPurchaseClick,
  processingPayment,
  paymentLoading,
}) => {
  // Currency modal states
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  // Currency helper functions
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹',
      'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr',
      'NZD': 'NZ$', 'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr',
      'TRY': '₺', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R'
    };
    return symbols[currency] || currency;
  };

  const getAvailableCurrencies = (song) => {
    if (!song.basePrice || !song.convertedPrices) return [];
    
    const currencies = [
      { currency: song.basePrice.currency, amount: song.basePrice.amount, isBaseCurrency: true },
      ...song.convertedPrices.map(price => ({
        currency: price.currency, amount: price.amount, isBaseCurrency: false
      }))
    ];
    
    return currencies;
  };

  const handleSongPurchaseClick = (song) => {
    const availableCurrencies = getAvailableCurrencies(song);
    
    if (availableCurrencies.length > 1) {
      setSelectedSong(song);
      setShowCurrencyModal(true);
    } else if (availableCurrencies.length === 1) {
      const currency = availableCurrencies[0];
      onPurchaseClick?.(song, "song", {
        currency: currency.currency, 
        amount: currency.amount, 
        symbol: getCurrencySymbol(currency.currency)
      });
    }
  };

  const handleCurrencySelect = (selectedCurrency) => {
    setShowCurrencyModal(false);
    if (selectedSong && selectedCurrency) {
      onPurchaseClick?.(selectedSong, "song", {
        currency: selectedCurrency.currency, 
        amount: selectedCurrency.amount, 
        symbol: getCurrencySymbol(selectedCurrency.currency)
      });
    }
    setSelectedSong(null);
  };

  const handleCloseCurrencyModal = () => {
    setShowCurrencyModal(false);
    setSelectedSong(null);
  };

  if (purchased) {
    return (
      <>
        <span className={`${btnBase} bg-emerald-600/80 text-white`}>Purchased</span>
        <CurrencySelectionModal
          open={showCurrencyModal}
          onClose={handleCloseCurrencyModal}
          onSelectCurrency={handleCurrencySelect}
          item={selectedSong}
          itemType="song"
        />
      </>
    );
  }

  if (song.accessType === "subscription") {
    return (
      <>
        <button
          type="button"
          className={`${btnBase} bg-indigo-600 hover:bg-indigo-700 text-white`}
          onClick={(e) => {
            e.stopPropagation();
            onSubscribeRequired?.(song.artist, "play", song);
          }}
          disabled={processingPayment || paymentLoading}
        >
          Subscription
        </button>
        <CurrencySelectionModal
          open={showCurrencyModal}
          onClose={handleCloseCurrencyModal}
          onSelectCurrency={handleCurrencySelect}
          item={selectedSong}
          itemType="song"
        />
      </>
    );
  }

  if (song.accessType === "purchase-only" && song?.basePrice?.amount > 0 && !purchased) {
    const priceNumber = Number(song?.basePrice?.amount);
    const canPay = Number.isFinite(priceNumber) && priceNumber > 0;
    const symbol = getCurrencySymbol(song?.basePrice?.currency);

    return (
      <>
        <button
          type="button"
          className={`${btnBase} bg-rose-600 hover:bg-rose-700 text-white`}
          onClick={(e) => {
            e.stopPropagation();
            if (processingPayment || paymentLoading) {
              toast.info("Payment already in progress...");
              return;
            }

            if (!canPay) {
              toast.error("Invalid price for this item");
              return;
            }

            if (alreadySubscribed) {
              handleSongPurchaseClick(song);
            } else {
              onSubscribeRequired?.(song.artist, "purchase", song);
            }
          }}
          aria-label={`Buy for ${symbol}${song?.basePrice?.amount}`}
        >
          Buy {symbol}{song?.basePrice?.amount}
        </button>
        <CurrencySelectionModal
          open={showCurrencyModal}
          onClose={handleCloseCurrencyModal}
          onSelectCurrency={handleCurrencySelect}
          item={selectedSong}
          itemType="song"
        />
      </>
    );
  }



  if (song.accessType === "purchase-only" && song?.albumOnly === true) {
    return (
      <>
        <span className={`${btnBase} bg-slate-600/80 text-white`}>Album</span>
        <CurrencySelectionModal
          open={showCurrencyModal}
          onClose={handleCloseCurrencyModal}
          onSelectCurrency={handleCurrencySelect}
          item={selectedSong}
          itemType="song"
        />
      </>
    );
  }

  return (
    <>
      <span className={`${btnBase} bg-teal-600/80 text-white`}>Free</span>
      <CurrencySelectionModal
        open={showCurrencyModal}
        onClose={handleCloseCurrencyModal}
        onSelectCurrency={handleCurrencySelect}
        item={selectedSong}
        itemType="song"
      />
    </>
  );
};

const GenreSongRow = ({
  song,
  img = song.coverImage || song.album?.coverImage || "/images/placeholder.png",
  songName = song.title,
  singerName = song.artist?.name || "Unknown",
  seekTime,
  isSelected,
  onPlay,
  onSubscribeRequired,
  onPurchaseClick, // Now expects (item, "song", currencyData)
  processingPayment,
  paymentLoading,
  purchased,
  alreadySubscribed,
}) => {
  const dispatch = useDispatch();
  const likedSongIds = useSelector(selectLikedSongIds);
  const isLiked = likedSongIds.includes(song._id);

  const debouncedLikeToggle = useCallback(
    debounce(async (songId, wasLiked) => {
      try {
        const resultAction = await dispatch(toggleLikeSong(songId));
        if (toggleLikeSong.fulfilled.match(resultAction)) {
          toast.success(wasLiked ? "Removed from Liked Songs" : "Added to Liked Songs");
        } else {
          toast.error("Failed to update like");
        }
      } catch {
        toast.error("Something went wrong");
      }
    }, 400),
    [dispatch]
  );

  const handleToggleLike = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!song?._id) return;
    debouncedLikeToggle(song._id, isLiked);
  };

  const handleRowClick = (e) => {
    if (e.target.closest(".action-button")) return;
    onPlay?.(song);
  };

  return (
    <div
      className={`flex w-full justify-between items-center p-2 cursor-pointer border-b ${
        isSelected ? "border-blue-500 bg-white/5" : "border-gray-700"
      } hover:bg-white/5 transition-colors group`}
      onClick={handleRowClick}
    >
      {/* Left */}
      <div className="flex items-center min-w-0">
        <div className="relative">
          <img
            src={img}
            alt={songName}
            className={`w-10 h-10 rounded-lg object-cover ${
              isSelected ? "shadow-[0_0_6px_1px_#3b82f6]" : ""
            }`}
          />
          <button
            type="button"
            className="action-button absolute -bottom-1 -right-1 bg-gray-200 text-black p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(song);
            }}
            title="Play"
            aria-label="Play"
          >
            <RiPlayFill size={12} />
          </button>
        </div>
        <div className="mx-4 min-w-0">
          <h3 className="text-white text-sm truncate">{songName}</h3>
          <p className="text-gray-400 text-xs truncate">{singerName}</p>
        </div>
      </div>

      {/* Middle */}
      {isSelected ? (
        <div className="equalizer mr-2">
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
          <span className="equalizer-bar"></span>
        </div>
      ) : (
        <div />
      )}

      {/* Right */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center text-gray-300">
          <MdAccessTimeFilled className="text-base text-gray-500" />
          <span className="ml-2 text-sm">{formatDuration(seekTime)}</span>
        </div>

        <button type="button" className="action-button" onClick={handleToggleLike}>
          {isLiked ? (
            <BsHeartFill className="text-red-600" />
          ) : (
            <BsHeart className="text-white" />
          )}
        </button>

        <FiMoreHorizontal
          className="action-button text-white text-lg"
          onClick={(e) => {
            e.stopPropagation();
            toast.info("More options coming soon");
          }}
          title="More"
          aria-label="More options"
        />

        <AccessChip
          song={song}
          purchased={purchased}
          alreadySubscribed={alreadySubscribed}
          onSubscribeRequired={onSubscribeRequired}
          onPurchaseClick={onPurchaseClick}
          processingPayment={processingPayment}
          paymentLoading={paymentLoading}
        />
      </div>
    </div>
  );
};

export default GenreSongRow;
