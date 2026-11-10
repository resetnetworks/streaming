// src/components/artist/revenue/ArtistDashboardRevenue.jsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  useArtistBalance,
  useArtistLedger,
  useArtistPayouts,
  useRequestPayout
} from '../../../hooks/api/useArtistRevenue';
import {
  LuWallet,
  LuTrendingUp,
  LuArrowUpRight,
  LuArrowDownRight,
  LuDownload,
  LuRefreshCw,
  LuReceipt,
  LuCircleAlert,
  LuCircleCheck,
  LuInfo,
  LuX,
  LuMail,
  LuDollarSign,
} from 'react-icons/lu';
import { FaPaypal } from 'react-icons/fa';

// Inner 3D panel style for main containers (matches Analytics Dashboard & Subscription Funnel)
const innerPanel3dStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #151e32 0%, #090e1a 100%)",
  boxShadow:
    "inset 0 3px 8px rgba(0, 0, 0, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.9), inset 0 -1px 1px rgba(255, 255, 255, 0.05)",
};

// Reusable 3D sunken well style (recessed hole effect matching CardStat)
const sunkenCardStyle = {
  background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
  border: "1px solid rgba(0, 0, 0, 0.95)",
  boxShadow:
    "inset 0 4px 8px rgba(0, 0, 0, 0.9), inset 0 1px 3px rgba(0, 0, 0, 0.95), inset 0 -1px 1px rgba(255, 255, 255, 0.08), 0 1px 0 rgba(255, 255, 255, 0.05)",
};

const MotionDiv = motion.div;

const ArtistDashboardRevenue = () => {
  // Filters & Pagination
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerType, setLedgerType] = useState('all');
  const [dateRange] = useState({
    start: '',
    end: ''
  });

  // React Query Hooks
  const balanceQuery = useArtistBalance();
  const ledgerQuery = useArtistLedger({
    page: ledgerPage,
    limit: 20,
    type: ledgerType === 'all' ? undefined : ledgerType,
    startDate: dateRange.start,
    endDate: dateRange.end
  });
  const payoutsQuery = useArtistPayouts();
  const requestPayoutMutation = useRequestPayout();

  // State for payout request modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  // Currency formatter - USD with standard formatting
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
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

    const availableBalance = balanceQuery.data?.balance?.availableBalance || 0;
    if (amount > availableBalance) {
      alert('Amount exceeds available balance');
      return;
    }

    requestPayoutMutation.mutate({ amount, paypalEmail }, {
      onSuccess: () => {
        setShowPayoutModal(false);
        setPayoutAmount('');
        setPaypalEmail('');
        balanceQuery.refetch();
        payoutsQuery.refetch();
      }
    });
  };

  const handleRefresh = () => {
    balanceQuery.refetch();
    ledgerQuery.refetch();
    payoutsQuery.refetch();
  };

  const availableBalance = balanceQuery.data?.balance?.availableBalance || 0;
  const totalEarned = balanceQuery.data?.balance?.totalEarned || 0;
  const totalPaidOut = balanceQuery.data?.balance?.totalPaidOut || 0;
  const canWithdraw = availableBalance > 0;
  const isRefreshing = balanceQuery.isFetching || ledgerQuery.isFetching || payoutsQuery.isFetching;

  // Filter ledger items on both client and server side for instant responsiveness
  const filteredLedger = useMemo(() => {
    const items = ledgerQuery.data?.ledger;
    if (!Array.isArray(items)) return [];
    if (ledgerType === 'all') return items;
    return items.filter((item) => String(item.type).toLowerCase() === ledgerType.toLowerCase());
  }, [ledgerQuery.data?.ledger, ledgerType]);

  // Prevent ledger flashing/blinking on filter switch
  const hasLedgerData = Boolean(ledgerQuery.data?.ledger);
  const isInitialLedgerLoading = ledgerQuery.isLoading && !hasLedgerData;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-dashboard-fade-in">

      {/* Header Section (Clean, without extra subtitle) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Revenue Dashboard
          </h1>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 cursor-pointer active:scale-95"
          style={{
            background: "#060911",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow:
              "inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
          title="Refresh Financial Data"
        >
          <LuRefreshCw
            className={`w-3.5 h-3.5 text-[#38bdf8] transition-transform ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 4 Professional Stat Cards (Clean Dark Luxury Style, No Neon Glow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

        {/* Card 1: Available Balance (No awkward bottom margin gap) */}
        <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md">
          <div
            className="h-full rounded-[15px] p-4 flex flex-col justify-start relative overflow-hidden"
            style={sunkenCardStyle}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Available Balance
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
                <LuWallet className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
              {balanceQuery.isLoading ? '...' : formatCurrency(availableBalance)}
            </div>
          </div>
        </div>

        {/* Card 2: Total Earned */}
        <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md">
          <div
            className="h-full rounded-[15px] p-4 flex flex-col justify-between relative overflow-hidden"
            style={sunkenCardStyle}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Earned
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
                <LuTrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {balanceQuery.isLoading ? '...' : formatCurrency(totalEarned)}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Lifetime subscription earnings
            </div>
          </div>
        </div>

        {/* Card 3: Total Paid Out */}
        <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md">
          <div
            className="h-full rounded-[15px] p-4 flex flex-col justify-between relative overflow-hidden"
            style={sunkenCardStyle}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Paid Out
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
                <LuCircleCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {balanceQuery.isLoading ? '...' : formatCurrency(totalPaidOut)}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Processed withdrawals
            </div>
          </div>
        </div>

        {/* Card 4: Payout Action Card */}
        <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent transition-all duration-200 shadow-md">
          <div
            className="h-full rounded-[15px] p-4 flex flex-col justify-between relative overflow-hidden"
            style={sunkenCardStyle}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Payout Transfer
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0459FE]/15 border border-[#0459FE]/25 text-[#38bdf8]">
                <FaPaypal className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-1">
              <div className="text-sm font-semibold text-white">
                PayPal Fast Transfer
              </div>
            </div>

            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={!canWithdraw}
              className={`w-full mt-2 py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                !canWithdraw
                  ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'text-white hover:brightness-110 active:scale-[0.98]'
              }`}
              style={
                canWithdraw
                  ? { background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)' }
                  : {}
              }
            >
              <LuDownload className="w-3.5 h-3.5" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Content: Balanced Widths (Ledger 7 cols, Payout History 5 cols on XL) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* Panel 1: Transaction Ledger (7 Cols on XL) */}
        <div className="xl:col-span-7 rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent">
          <div
            className="h-full rounded-2xl flex flex-col overflow-hidden"
            style={innerPanel3dStyle}
          >
            {/* Table Header & Animated Smooth Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Transaction Ledger
                </h2>
              </div>

              {/* Type Filter Pills with Smooth Framer Motion Slide Indicator */}
              <div
                className="flex items-center gap-1 p-1 rounded-xl self-start sm:self-auto"
                style={{
                  background: "#060911",
                  border: "1px solid rgba(0, 0, 0, 0.95)",
                  boxShadow:
                    "inset 0 3px 6px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.05)",
                }}
              >
                {['all', 'credit', 'debit'].map((type) => {
                  const isActive = ledgerType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setLedgerType(type);
                        setLedgerPage(1);
                      }}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {isActive && (
                        <MotionDiv
                          layoutId="activeLedgerTypePill"
                          className="absolute inset-0 bg-[#0459FE] rounded-lg shadow-sm shadow-[#0459FE]/40"
                          transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative z-10">{type.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Content (Clear, Larger Font Sizes, No Blinking) */}
            <div className="overflow-x-auto flex-1">
              {isInitialLedgerLoading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-white/20 border-t-[#38bdf8]"></div>
                  <p className="text-sm text-slate-400 mt-3 font-medium">Loading ledger...</p>
                </div>
              ) : ledgerQuery.error ? (
                <div className="p-8 text-center text-slate-400">
                  <LuCircleAlert className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                  <p className="text-sm text-rose-300 font-medium">
                    {ledgerQuery.error?.message || "Failed to load ledger records"}
                  </p>
                </div>
              ) : filteredLedger.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <LuReceipt className="w-8 h-8 text-slate-600 mx-auto mb-2 stroke-1" />
                  <p className="text-sm font-medium">No ledger transactions found</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/30 border-b border-white/5">
                      <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Description</th>
                      <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider text-right">Amount</th>
                      <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-white/5 text-sm transition-opacity duration-200 ${ledgerQuery.isFetching ? 'opacity-70' : 'opacity-100'}`}>
                    {filteredLedger.map((item, index) => {
                      const isCredit = item.type === 'credit';
                      return (
                        <tr
                          key={index}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="p-4 text-sm text-slate-300 whitespace-nowrap">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="p-4">
                            <div className="text-sm sm:text-base font-semibold text-white">{item.description}</div>
                            {item.reference && (
                              <div className="text-xs text-slate-400 mt-0.5">{item.reference}</div>
                            )}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <span
                              className={`text-sm sm:text-base font-bold inline-flex items-center gap-1.5 ${
                                isCredit ? 'text-emerald-400' : 'text-slate-300'
                              }`}
                            >
                              {isCredit ? (
                                <LuArrowDownRight className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <LuArrowUpRight className="w-4 h-4 text-slate-400" />
                              )}
                              {formatCurrency(item.amountUSD || item.amount)}
                            </span>
                          </td>
                          {/* Clean Plain Text Without Capsule */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <span
                              className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                                isCredit ? 'text-emerald-400' : 'text-slate-400'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {filteredLedger.length > 0 && (
              <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/20">
                <button
                  onClick={() => setLedgerPage((prev) => Math.max(1, prev - 1))}
                  disabled={ledgerPage === 1 || ledgerQuery.isLoading}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#060911] border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs sm:text-sm text-slate-300">Page {ledgerPage}</span>
                <button
                  onClick={() => setLedgerPage((prev) => prev + 1)}
                  disabled={ledgerQuery.isLoading || filteredLedger.length < 20}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#060911] border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Payout History (Increased Width: 5 Cols on XL) */}
        <div className="xl:col-span-5 rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent">
          <div
            className="h-full rounded-2xl flex flex-col overflow-hidden"
            style={innerPanel3dStyle}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/5">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Payout History
              </h2>
            </div>

            {/* Payouts Table (Clear, Larger Font Sizes) */}
            <div className="overflow-x-auto flex-1">
              {payoutsQuery.isLoading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-white/20 border-t-[#38bdf8]"></div>
                  <p className="text-sm text-slate-400 mt-3 font-medium">Loading payouts...</p>
                </div>
              ) : payoutsQuery.error ? (
                <div className="p-8 text-center text-slate-400">
                  <LuCircleAlert className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                  <p className="text-sm text-rose-300 font-medium">
                    {payoutsQuery.error?.message || "Failed to load payout history"}
                  </p>
                </div>
              ) : (payoutsQuery.data?.payouts || []).length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <FaPaypal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">No payout requests recorded</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/30 border-b border-white/5">
                      <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Amount</th>
                      <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider text-center">Status</th>
                      <th className="p-4 text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {(payoutsQuery.data?.payouts || []).map((payout, index) => {
                      const isPaid = payout.status === 'paid';
                      const isRequested = payout.status === 'requested';
                      return (
                        <tr
                          key={index}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="p-4 text-sm text-slate-300 whitespace-nowrap">
                            {formatDate(payout.createdAt)}
                          </td>
                          <td className="p-4 text-sm sm:text-base text-white font-bold whitespace-nowrap">
                            {formatCurrency(payout.amount)}
                          </td>
                          {/* Clean Plain Text Without Capsule */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <span
                              className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                                isPaid
                                  ? 'text-emerald-400'
                                  : isRequested
                                  ? 'text-sky-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {payout.status}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                              <FaPaypal className="text-[#38bdf8] text-sm" />
                              <span className="capitalize">{payout.paymentMethod || 'PayPal'}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Payout Request Modal (Sleek Dark Theme Matching App Identity) */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-dashboard-fade-in">
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent w-full max-w-md shadow-2xl">
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={innerPanel3dStyle}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#38bdf8] flex items-center justify-center">
                    <FaPaypal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Request Payout</h3>
                    <p className="text-xs text-slate-400">Withdraw earnings directly to PayPal</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePayoutRequest} className="space-y-4">
                {/* Available Balance Box in Sunken Style */}
                <div
                  className="p-3.5 rounded-xl flex items-center justify-between"
                  style={sunkenCardStyle}
                >
                  <div className="flex items-center gap-2">
                    <LuInfo className="w-4 h-4 text-[#38bdf8]" />
                    <span className="text-xs font-semibold text-slate-400">Available to Withdraw</span>
                  </div>
                  <div className="text-lg font-black text-white">
                    {formatCurrency(availableBalance)}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Amount to Withdraw (USD)
                  </label>
                  <div className="relative">
                    <LuDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      max={availableBalance}
                      step="0.01"
                      className="w-full bg-[#050811] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0459FE] focus:ring-1 focus:ring-[#0459FE] transition-colors"
                      required
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex justify-between">
                    <span>Minimum: $1.00</span>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(String(availableBalance))}
                      className="text-[#38bdf8] hover:underline cursor-pointer"
                    >
                      Max amount
                    </button>
                  </div>
                </div>

                {/* PayPal Email Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    PayPal Account Email
                  </label>
                  <div className="relative">
                    <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="artist@paypal.com"
                      className="w-full bg-[#050811] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#0459FE] focus:ring-1 focus:ring-[#0459FE] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestPayoutMutation.isPending || !payoutAmount || !paypalEmail}
                    className="flex-1 py-2.5 px-4 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_16px_rgba(51,128,255,0.25)] hover:brightness-110 active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)'
                    }}
                  >
                    {requestPayoutMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      'Confirm Payout'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ArtistDashboardRevenue;