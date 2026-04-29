// SubscriptionMethodModal.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaChevronDown } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { SiRazorpay } from "react-icons/si";
import { FaPaypal, FaStripe } from "react-icons/fa";

// ---------- Constants ----------
const CURRENCIES = [
  { currency: "USD", symbol: "$", name: "US Dollar" },
  { currency: "EUR", symbol: "€", name: "Euro" },
  { currency: "GBP", symbol: "£", name: "British Pound" },
  { currency: "JPY", symbol: "¥", name: "Japanese Yen" },
  { currency: "INR", symbol: "₹", name: "Indian Rupee" },
];

const PAYPAL_SUPPORTED = ["USD", "EUR", "GBP", "JPY"];

const getCycleLabel = (cycle) =>
  ({ "1m": "Monthly", "3m": "3 Months", "6m": "6 Months", "12m": "Annual" })[
    cycle
  ] || cycle;

const formatAmount = (amount) => {
  const n = Number(amount);
  if (!n) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

// ---------- Portal Dropdown ----------
const PortalDropdown = ({ triggerRef, open, onClose, children }) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }, [triggerRef]);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [open, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return createPortal(
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
        transformOrigin: "top",
      }}
      className="bg-[#181c22] border border-white/[0.07] rounded-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      <div className="max-h-64 overflow-y-auto no-scrollbar">{children}</div>
    </motion.div>,
    document.body,
  );
};

// ---------- Currency Dropdown Item ----------
const CurrencyDropdownItem = ({ currency, symbol, amount, name, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors text-left group"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white font-bold text-sm">
        {symbol}
      </div>
      <div>
        <div className="text-sm font-semibold text-[#e0e2ec]">{currency}</div>
        <div className="text-xs text-[#8b919f]">{name}</div>
      </div>
    </div>
    <div className="font-bold text-sm text-[#e0e2ec]">
      {symbol}{formatAmount(amount)}
    </div>
  </button>
);

// ---------- Gateway Button ----------
const GatewayButton = ({ id, name, description, icon, badge, onClick }) => {
  const configs = {
    stripe: {
      iconBg: "bg-white-500/10 border-white-500/20",
      iconColor: "text-white",
      hoverBorder: "hover:border-blue-500/40",
    },
    razorpay: {
      iconBg: "bg-white-500/10 border-white-500/20",
      iconColor: "text-white",
      hoverBorder: "hover:border-blue-500/40",
    },
    paypal: {
      iconBg: "bg-white-500/10 border-white-500/20",
      iconColor: "text-white",
      hoverBorder: "hover:border-blue-500/40",
    },
  };

  const cfg = configs[id] || configs.stripe;

  return (
    <motion.button
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      className={`w-full flex items-center gap-5 px-5 py-4 
        bg-[#0b0e15] border border-white/[0.06] ${cfg.hoverBorder}
        rounded-xl transition-all duration-200 group
        shadow-[0_2px_12px_rgba(0,0,0,0.2)]
        `}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl ${cfg.iconBg} border 
          flex items-center justify-center shrink-0
          transition-transform duration-200`}
      >
        {React.cloneElement(icon, {
          className: `w-6 h-6 ${cfg.iconColor}`,
        })}
      </div>

      {/* Text */}
      <div className="text-left flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[15px] text-[#e0e2ec]">{name}</h3>
          {badge && (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold 
                uppercase tracking-widest bg-[#aac7ff]/10 text-[#aac7ff] border border-[#aac7ff]/20"
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-[12px] text-[#8b919f] mt-0.5 font-medium">
          {description}
        </p>
      </div>

      {/* Arrow */}
      <motion.span
        initial={{ x: 0, opacity: 0.4 }}
        whileHover={{ x: 3, opacity: 1 }}
        className="text-[#414753] group-hover:text-[#aac7ff] transition-colors duration-200 shrink-0 text-lg"
      >
        ›
      </motion.span>
    </motion.button>
  );
};

// ---------- Main Modal ----------
const SubscriptionMethodModal = ({
  open,
  onClose,
  onSelectMethod,
  artist,
  cycle,
  subscriptionPrice,
}) => {
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef(null);

  const currentPlan = artist?.subscriptionPlans?.find((p) => p.cycle === cycle);

  const getPriceForCurrency = useCallback(
    (currency) => {
      if (!currentPlan) return null;
      if (currentPlan.basePrice?.currency === currency) {
        return { amount: currentPlan.basePrice.amount, isBase: true };
      }
      const converted = currentPlan.convertedPrices?.find(
        (p) => p.currency === currency,
      );
      if (converted) return { amount: converted.amount, isBase: false };
      return null;
    },
    [currentPlan],
  );

  const availablePrices = useMemo(() => {
    return CURRENCIES.map((c) => {
      const priceData = getPriceForCurrency(c.currency);
      if (!priceData && c.currency !== "USD") return null;
      return {
        ...c,
        amount: priceData?.amount ?? subscriptionPrice,
        isBase: priceData?.isBase ?? true,
      };
    }).filter(Boolean);
  }, [getPriceForCurrency, subscriptionPrice]);

    useEffect(() => {
    if (!open) {
      setDropdownOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && availablePrices.length > 0 && !selectedPrice) {
      const userLocale =
        typeof navigator !== "undefined" ? navigator.language : "en-US";
      const getCurrencyFromLocale = (locale) => {
        if (!locale) return "USD";
        const map = {
          IN: "INR", US: "USD", GB: "GBP",
          JP: "JPY", DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR",
        };
        const countryCode = locale.split("-")[1];
        return map[countryCode] || "USD";
      };
      const detectedCurrency = getCurrencyFromLocale(userLocale);
      const preferred =
        availablePrices.find((p) => p.currency === detectedCurrency) ||
        availablePrices.find((p) => p.currency === "USD") ||
        availablePrices[0];
      setSelectedPrice(preferred);
    }
    if (!open) setSelectedPrice(null);
  }, [open, availablePrices]);

  if (!open || !artist || !cycle || subscriptionPrice === undefined) return null;

  const cycleLabel = getCycleLabel(cycle);
  const cycleLower = cycleLabel.toLowerCase();

  const getGatewaysForCurrency = (currency) => {
    const isINR = currency === "INR";
    const paypalOk = PAYPAL_SUPPORTED.includes(currency);
    const list = [];
    if (isINR) {
      list.push({
        id: "razorpay",
        name: "Razorpay",
        description: "UPI, Cards, Net Banking & Wallets",
        icon: <SiRazorpay />,
        badge: "Instant",
      });
      list.push({
        id: "stripe",
        name: "Stripe",
        description: "Cards, Apple Pay, Google Pay",
        icon: <FaStripe />,
        badge: null,
      });
    } else {
      list.push({
        id: "stripe",
        name: "Stripe",
        description: "Cards, Apple Pay, Google Pay",
        icon: <FaStripe />,
        badge: "Recommended",
      });
      list.push({
        id: "razorpay",
        name: "Razorpay",
        description: "UPI, Cards, Net Banking & Wallets",
        icon: <SiRazorpay />,
        badge: null,
      });
      if (paypalOk) {
        list.push({
          id: "paypal",
          name: "PayPal",
          description: "Secure PayPal subscription",
          icon: <FaPaypal />,
          badge: null,
        });
      }
    }
    return list;
  };

  const gateways = selectedPrice ? getGatewaysForCurrency(selectedPrice.currency) : [];

  const handleGatewaySelect = (gatewayId) => {
    if (!selectedPrice) return;
    const { currency, amount } = selectedPrice;
    if (gatewayId === "stripe") {
      onSelectMethod("stripe", { currency, amount });
    } else if (gatewayId === "razorpay") {
      onSelectMethod("razorpay", { currency, amount });
    } else if (gatewayId === "paypal") {
      const paypalPlans = currentPlan?.paypalPlans || [];
      const matchingPlan = paypalPlans.find((pp) => pp.currency === currency);
      if (matchingPlan) {
        onSelectMethod("paypal", { paypalPlan: matchingPlan });
      } else if (paypalPlans.length >= 1) {
        onSelectMethod("paypal", { paypalPlan: paypalPlans[0] });
      } else {
        console.error("PayPal subscription not available");
      }
    }
  };

  const priceVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full max-w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Modal Shell ── */}
            <div className="relative w-full bg-[#0b0e15] rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]">

              {/* ── Header ── */}
              <header className="flex justify-between items-center px-7 py-5">
                <h1 className="text-[17px] font-extrabold tracking-tight text-[#e0e2ec]">
                  Choose Currency &amp; Payment
                </h1>
                <motion.button
                  whileHover={{backgroundColor: "rgba(255,255,255,0.06)" }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-[#8b919f] transition-colors"
                >
                  <MdClose className="w-5 h-5" />
                </motion.button>
              </header>

              {/* Thin separator */}
              <div className="h-px bg-white/[0.05] mx-7" />

              {/* ── Scrollable Content ── */}
              <main className="px-7 pt-6 pb-7 space-y-6 max-h-[78vh] overflow-y-auto">

                {/* ── Plan Summary Card ── */}
                <section
                  className="relative p-6 rounded-xl overflow-hidden"
                  style={{
                    background: "linear-gradient(45deg, #0F3272 0%, #1A5DB4 100%, #3B82F6 100%)",
                  }}
                >
                  {/* Decorative blobs */}
                  <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/[0.07] rounded-full blur-xl pointer-events-none" />

                  <div className="relative flex justify-between items-end gap-4">
                    <div className="space-y-1 min-w-0">
                      <h2 className="text-[20px] font-black text-white/90 leading-tight">
                        {cycleLabel} Subscription
                      </h2>
                      <p className="text-[13px] text-white/40 font-semibold">
                        Artist: {artist.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={selectedPrice?.amount}
                          variants={priceVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ type: "spring", stiffness: 320, damping: 26 }}
                          className="block text-[38px] font-black tracking-tighter text-white/100 leading-none"
                        >
                          {selectedPrice?.symbol || "$"}
                          {selectedPrice
                            ? formatAmount(selectedPrice.amount)
                            : formatAmount(subscriptionPrice)}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[11px] font-semibold text-white/40 mt-0.5 block">
                        Billed every {cycleLower}
                      </span>
                    </div>
                  </div>
                </section>

                {/* ── Currency Selection ── */}
                <section className="space-y-2.5">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-white/80 ml-0.5">
                    Select Currency
                  </label>
                  <div className="relative">
                    <button
                      ref={triggerRef}
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full flex items-center justify-between px-5 py-3.5 
                        bg-[#181c22] hover:bg-[#1c2026] 
                        rounded-xl border border-white/[0.06] hover:border-white/[0.1]
                        transition-all duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[14px] text-[#e0e2ec]">
                          {selectedPrice?.currency} – {selectedPrice?.name}
                        </span>
                      </div>
                      <motion.span
                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        className="text-[#8b919f]"
                      >
                        <FaChevronDown className="w-3.5 h-3.5" />
                      </motion.span>
                    </button>

                    <PortalDropdown
                      triggerRef={triggerRef}
                      open={dropdownOpen}
                      onClose={() => setDropdownOpen(false)}
                    >
                      {availablePrices.map((price) => (
                        <CurrencyDropdownItem
                          key={price.currency}
                          symbol={price.symbol}
                          amount={price.amount}
                          currency={price.currency}
                          name={price.name}
                          onClick={() => {
                            setSelectedPrice(price);
                            setDropdownOpen(false);
                          }}
                        />
                      ))}
                    </PortalDropdown>
                  </div>
                </section>

                {/* ── Payment Gateways ── */}
                <section className="space-y-2.5">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-white/80 ml-0.5">
                    Payment Method
                  </label>
                  <div className="space-y-2.5">
                    {gateways.map((gw) => (
                      <GatewayButton
                        key={gw.id}
                        {...gw}
                        onClick={() => handleGatewaySelect(gw.id)}
                      />
                    ))}
                  </div>
                </section>
              </main>

              {/* ── Footer ── */}
              <footer className="px-7 py-5 bg-[#181c22] border-t border-white/[0.05] flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-[#8b919f]">
                  <FaLock
                    className="text-[#aac7ff]"
                    style={{ fontSize: "11px" }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                    Secure &amp; Encrypted Payments
                  </span>
                </div>
              </footer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionMethodModal;