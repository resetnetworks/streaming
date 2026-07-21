import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdCampaign,
  MdTrendingUp,
  MdMouse,
  MdShowChart,
  MdAttachMoney,
  MdAdd,
  MdSearch,
  MdImage,
  MdPlayArrow,
  MdPause,
  MdCloudUpload,
  MdArrowBack,
  MdInfo,
  MdAccountBalanceWallet,
  MdHistory,
  MdPayment,
  MdCheckCircle,
  MdSpeed,
  MdStar
} from "react-icons/md";

// Mock initial campaigns data
const INITIAL_CAMPAIGNS = [
  {
    id: "1",
    name: "Not Today Single Release",
    type: "featured",
    targetType: "genre",
    genres: ["K-Pop", "Pop"],
    regions: ["Mumbai", "Delhi", "Bengaluru"],
    budgetType: "daily",
    budgetLimit: 15.00,
    spent: 42.50,
    startDate: "2026-07-01",
    endDate: "2026-07-15",
    status: "ACTIVE",
    impressions: 12450,
    clicks: 432,
    destinationLink: "/song/not-today-123",
    assetName: "not_today_artwork.png"
  },
  {
    id: "2",
    name: "Summer Vibes Banner Campaign",
    type: "banner",
    targetType: "general",
    genres: [],
    regions: ["All India"],
    budgetType: "lifetime",
    budgetLimit: 250.00,
    spent: 180.20,
    startDate: "2026-06-15",
    endDate: "2026-07-10",
    status: "PAUSED",
    impressions: 48900,
    clicks: 1245,
    destinationLink: "/album/summer-vibes-456",
    assetName: "summer_banner_728x90.png"
  }
];

// Mock wallet transactions
const INITIAL_TRANSACTIONS = [
  {
    id: "t1",
    date: "2026-07-07",
    type: "DEPOSIT",
    description: "Stripe Top-up",
    amount: 150.00
  },
  {
    id: "t2",
    date: "2026-07-05",
    type: "AD_SPEND",
    description: "Daily Deductions - Not Today Release",
    amount: -15.00
  },
  {
    id: "t3",
    date: "2026-07-01",
    type: "DEPOSIT",
    description: "Stripe Top-up",
    amount: 200.00
  }
];

const CTRSpeedometer = ({ ctr }) => {
  const numericCtr = parseFloat(ctr) || 0;
  const clampedCtr = Math.min(Math.max(numericCtr, 0), 10);
  const needleRotation = -90 + (clampedCtr / 10) * 180;

  return (
    <div className="flex flex-col items-center justify-center bg-[#0A0A23] border border-gray-800 rounded-xl p-5 relative overflow-hidden shadow-md h-full w-full">
      <div className="absolute top-3 right-3 text-xs text-gray-500 flex items-center gap-1">
        <MdSpeed className="text-[#4DB3FF]" /> CTR Speedometer
      </div>
      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 self-start">Campaign Pacing Speed</div>

      <div className="relative w-44 h-22 flex items-end justify-center mt-3 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <defs>
            <linearGradient id="speedometer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#18182f"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="url(#speedometer-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="126"
            strokeDashoffset={126 - (clampedCtr / 10) * 126}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute bottom-0 w-3 h-3 bg-white rounded-full border border-[#4DB3FF] shadow z-20"></div>

        <motion.div
          className="absolute bottom-0 w-0.5 h-14 bg-gradient-to-t from-[#4DB3FF] to-white origin-bottom z-10 rounded-full"
          style={{ bottom: "0px", left: "calc(50% - 1px)" }}
          initial={{ rotate: -90 }}
          animate={{ rotate: needleRotation }}
          transition={{ type: "spring", stiffness: 45, damping: 10 }}
        />
      </div>

      <div className="text-center mt-4">
        <div className="text-2xl font-black text-white tracking-widest">{ctr}%</div>
        <div className="text-[10px] font-bold tracking-widest uppercase mt-0.5" style={{
          color: numericCtr < 2 ? "#ef4444" : numericCtr < 5 ? "#f59e0b" : "#10b981"
        }}>
          {numericCtr < 2 ? "Slow Traffic" : numericCtr < 5 ? "Normal Pacing" : "Optimal Velocity 🔥"}
        </div>
      </div>
    </div>
  );
};

const AdvertsComponent = () => {
  const [view, setView] = useState("list"); // "list" | "create"
  const [activeSubTab, setActiveSubTab] = useState("campaigns"); // "campaigns" | "wallet"
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [walletBalance, setWalletBalance] = useState(335.00); // 150 + 200 - 15
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    type: "banner", // "banner" | "featured"
    targetType: "general",
    genres: [],
    regions: "",
    budgetType: "daily",
    budgetLimit: "",
    startDate: "",
    endDate: "",
    destinationLink: "",
    assetFile: null,
    assetPreviewUrl: ""
  });

  const availableGenres = ["Pop", "K-Pop", "Hip Hop", "R&B", "Rock", "Electronic", "Jazz", "Classical"];

  // Calculate stats
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);

  // Auto-fill Campaign Name based on the selected release
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    let autoName = form.name;

    if (value === "/song/not-today-123") {
      autoName = "Not Today (Single) Promo";
    } else if (value === "/album/spring-day-789") {
      autoName = "Spring Day (LP) Promo";
    } else if (value === "/artist/profile") {
      autoName = "Artist Profile Promo";
    }

    setForm(prev => ({
      ...prev,
      destinationLink: value,
      name: autoName
    }));
  };

  // Handle Campaign Launch (checks wallet balance)
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.budgetLimit || !form.startDate || !form.endDate || !form.destinationLink) {
      alert("Please fill in all required fields.");
      return;
    }

    const budget = parseFloat(form.budgetLimit);
    if (budget > walletBalance) {
      alert(`Insufficient funds in Promo Wallet. Your budget limit is ${formatCurrency(budget)}, but your balance is ${formatCurrency(walletBalance)}. Please Top Up your wallet first.`);
      return;
    }

    // Deduct from wallet
    setWalletBalance(prev => prev - budget);

    // Create Campaign
    const newCampaign = {
      id: String(campaigns.length + 1),
      name: form.name,
      type: form.type,
      targetType: form.targetType,
      genres: form.targetType === "genre" ? form.genres : [],
      regions: form.regions ? form.regions.split(",").map(r => r.trim()) : ["All India"],
      budgetType: form.budgetType,
      budgetLimit: budget,
      spent: 0.00,
      startDate: form.startDate,
      endDate: form.endDate,
      status: "PENDING_REVIEW",
      impressions: 0,
      clicks: 0,
      destinationLink: form.destinationLink,
      assetName: form.assetFile ? form.assetFile.name : (form.type === "featured" ? "search_boost_art.png" : "sample_banner.png")
    };

    // Log transaction
    const newTx = {
      id: `t${transactions.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      type: "AD_SPEND",
      description: `Reserve campaign budget: ${form.name}`,
      amount: -budget
    };

    setCampaigns([newCampaign, ...campaigns]);
    setTransactions([newTx, ...transactions]);
    setView("list");
    setActiveSubTab("campaigns");

    // Reset Form
    setForm({
      name: "",
      type: "banner",
      targetType: "general",
      genres: [],
      regions: "",
      budgetType: "daily",
      budgetLimit: "",
      startDate: "",
      endDate: "",
      destinationLink: "",
      assetFile: null,
      assetPreviewUrl: ""
    });
  };

  // Mock Top Up Process
  const handleTopUpSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsProcessingTopUp(true);
    setTimeout(() => {
      setWalletBalance(prev => prev + amount);
      const newTx = {
        id: `t${transactions.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        type: "DEPOSIT",
        description: "Stripe Wallet Deposit",
        amount: amount
      };
      setTransactions([newTx, ...transactions]);
      setIsProcessingTopUp(false);
      setShowTopUpModal(false);
      setTopUpAmount("");
    }, 1500); // 1.5s visual loader
  };

  const handleToggleStatus = (id) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        if (c.status === "ACTIVE") return { ...c, status: "PAUSED" };
        if (c.status === "PAUSED") return { ...c, status: "ACTIVE" };
      }
      return c;
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm(prev => ({
        ...prev,
        assetFile: file,
        assetPreviewUrl: url
      }));
    }
  };

  const toggleGenre = (genre) => {
    setForm(prev => {
      const exists = prev.genres.includes(genre);
      const newGenres = exists
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres: newGenres };
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6 font-jura select-none relative min-h-[500px]">


      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider flex items-center gap-3">
            <MdCampaign className="text-[#4DB3FF] text-3xl" />
            Ad Campaign Manager
          </h1>
          <p className="text-gray-400 text-sm mt-1">Fund your wallet and run targeted ad campaigns to boost your listens.</p>
        </div>

        <div className="flex gap-3">
          {view === "list" ? (
            <>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#4DB3FF]/40 text-[#4DB3FF] bg-[#4DB3FF]/10 hover:bg-[#4DB3FF]/20 transition-all font-semibold cursor-pointer active:scale-95"
              >
                <MdAccountBalanceWallet />
                Top Up Wallet
              </button>
              <button
                onClick={() => setView("create")}
                className="flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold cursor-pointer transform hover:scale-[1.02] active:scale-95"
                style={{
                  background: "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)",
                  border: "1px solid rgba(77, 179, 255, 0.4)"
                }}
              >
                <MdAdd className="text-lg" />
                Create Campaign
              </button>
            </>
          ) : (
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 bg-gray-800/80 hover:bg-gray-800 rounded-lg border border-gray-700 transition-all cursor-pointer"
            >
              <MdArrowBack />
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* 2. Symmetrical Row of 5 Small Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

              {/* Card 1: Prepaid Balance (Stripe Top Up) */}
              <div className="relative p-5 rounded-xl bg-gradient-to-br from-[#0F3272]/20 to-[#0A0A23] border border-[#4DB3FF]/30 hover:border-[#4DB3FF]/50 transition-all duration-300 shadow-md flex flex-col justify-between h-full min-h-[142px]">
                <div className="absolute top-4 right-4">
                  <MdAccountBalanceWallet className="text-xl text-[#4DB3FF]" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Promo Balance</div>
                  <div className="text-2xl font-black text-[#4DB3FF] mt-1.5">
                    {formatCurrency(walletBalance)}
                  </div>
                </div>
                <button
                  onClick={() => setShowTopUpModal(true)}
                  className="text-[10px] text-white bg-[#3380FF] hover:bg-[#3380FF]/80 font-bold px-3 py-1 rounded transition-colors self-start mt-3 cursor-pointer shadow active:scale-95"
                >
                  Add Funds
                </button>
              </div>

              {/* Card 2: Impressions */}
              <div className="relative p-5 rounded-xl bg-[#0A0A23] border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-md flex flex-col justify-between h-full min-h-[142px]">
                <div className="absolute top-4 right-4">
                  <MdShowChart className="text-xl text-blue-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Impressions</div>
                  <div className="text-2xl font-black text-white mt-1.5">
                    {totalImpressions.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium mt-3">Ad deliveries logged</span>
              </div>

              {/* Card 3: Total Clicks */}
              <div className="relative p-5 rounded-xl bg-[#0A0A23] border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-md flex flex-col justify-between h-full min-h-[142px]">
                <div className="absolute top-4 right-4">
                  <MdMouse className="text-xl text-emerald-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Clicks</div>
                  <div className="text-2xl font-black text-white mt-1.5">
                    {totalClicks.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-emerald-400/90 font-medium mt-3">Direct listener responses</span>
              </div>

              {/* Card 4: Micro Speedometer (Visibility Velocity) */}
              <div className="relative p-5 rounded-xl bg-[#0A0A23] border border-gray-800 hover:border-[#4DB3FF]/30 transition-all duration-300 shadow-md flex flex-col justify-between h-full min-h-[142px]">
                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Visibility Velocity</div>

                <div className="flex items-center justify-between gap-3 mt-1">
                  {/* Micro SVG Gauge */}
                  <div className="relative w-20 h-10 flex items-end justify-center overflow-hidden flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                      <defs>
                        <linearGradient id="micro-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#18182f"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="url(#micro-gauge-grad)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="126"
                        strokeDashoffset={126 - (Math.min(Math.max(parseFloat(avgCtr) || 0, 0), 10) / 10) * 126}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <div className="absolute bottom-0 w-2 h-2 bg-white rounded-full border border-[#4DB3FF] shadow z-20"></div>

                    <motion.div
                      className="absolute bottom-0 w-0.5 h-7 bg-gradient-to-t from-[#4DB3FF] to-white origin-bottom z-10 rounded-full"
                      style={{ bottom: "0px", left: "calc(50% - 0.5px)" }}
                      initial={{ rotate: -90 }}
                      animate={{ rotate: -90 + (Math.min(Math.max(parseFloat(avgCtr) || 0, 0), 10) / 10) * 180 }}
                      transition={{ type: "spring", stiffness: 45, damping: 10 }}
                    />
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-white">{avgCtr}%</div>
                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">CTR Speed</div>
                  </div>
                </div>

                <div className="text-xs font-bold tracking-wide mt-2" style={{
                  color: parseFloat(avgCtr) < 2 ? "#ef4444" : parseFloat(avgCtr) < 5 ? "#f59e0b" : "#10b981"
                }}>
                  Growth is {parseFloat(avgCtr) < 2 ? "slow" : parseFloat(avgCtr) < 5 ? "steady" : "optimal 🔥"}
                </div>
              </div>

              {/* Card 5: Budget Spent */}
              <div className="relative p-5 rounded-xl bg-[#0A0A23] border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-md flex flex-col justify-between h-full min-h-[142px]">
                <div className="absolute top-4 right-4">
                  <MdAttachMoney className="text-xl text-amber-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Budget Spent</div>
                  <div className="text-2xl font-black text-white mt-1.5">
                    {formatCurrency(totalSpent)}
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium mt-3">Invested in promos</span>
              </div>

            </div>

            {/* 3. Sub Tabs Menu */}
            <div className="flex border-b border-gray-800/80 mb-6">
              <button
                onClick={() => setActiveSubTab("campaigns")}
                className={`px-6 py-3 font-semibold text-sm transition-all cursor-pointer relative ${activeSubTab === "campaigns" ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
              >
                My Campaigns
                {activeSubTab === "campaigns" && (
                  <motion.div layoutId="subtab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4DB3FF]" />
                )}
              </button>
              <button
                onClick={() => setActiveSubTab("wallet")}
                className={`px-6 py-3 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 relative ${activeSubTab === "wallet" ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
              >
                <MdHistory />
                Wallet Transaction Ledger
                {activeSubTab === "wallet" && (
                  <motion.div layoutId="subtab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4DB3FF]" />
                )}
              </button>
            </div>

            {activeSubTab === "campaigns" ? (
              /* Tab Content 1: Campaigns Table */
              <div className="w-full rounded-[12px] p-[1px] bg-gradient-to-br from-white/10 to-[#0c0d0d] shadow-2xl">
                <div className="bg-[#0A0A23] rounded-[10px] overflow-hidden">
                  <div className="p-5 border-b border-gray-800/80 flex justify-between items-center">
                    <h3 className="text-white text-lg font-bold tracking-wider">Adverts Campaign Overview</h3>
                    <span className="text-gray-400 text-sm">{campaigns.length} active/past campaigns</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                      <thead className="bg-[#020216] text-gray-400 text-xs uppercase tracking-widest border-b border-gray-800/80">
                        <tr>
                          <th className="py-4 px-6">Name / Details</th>
                          <th className="py-4 px-6 text-center">Type</th>
                          <th className="py-4 px-6">Schedule</th>
                          <th className="py-4 px-6 text-right">Budget Limit</th>
                          <th className="py-4 px-6 text-right">Spent</th>
                          <th className="py-4 px-6 text-center">Impressions</th>
                          <th className="py-4 px-6 text-center">Clicks (CTR)</th>
                          <th className="py-4 px-6 text-center">Status</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {campaigns.map((camp) => {
                          const ctr = camp.impressions > 0 ? ((camp.clicks / camp.impressions) * 100).toFixed(2) : "0.00";
                          return (
                            <tr key={camp.id} className="hover:bg-gray-900/30 transition-colors">
                              <td className="py-4 px-6">
                                <div className="font-bold text-white tracking-wide text-sm">{camp.name}</div>
                                <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                  Links to: <span className="text-[#4DB3FF]/85">{camp.destinationLink}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300">
                                  {camp.type === "featured" ? (
                                    <>
                                      <MdStar className="text-yellow-400" />
                                      Featured
                                    </>
                                  ) : (
                                    <>
                                      <MdImage className="text-emerald-400" />
                                      Banner
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-xs text-gray-400">
                                <div>Start: {camp.startDate}</div>
                                <div className="mt-1">End: {camp.endDate}</div>
                              </td>
                              <td className="py-4 px-6 text-right font-bold text-gray-100 text-sm">
                                {formatCurrency(camp.budgetLimit)} <span className="text-[10px] text-gray-500 font-normal">/{camp.budgetType}</span>
                              </td>
                              <td className="py-4 px-6 text-right font-semibold text-gray-300 text-sm">
                                {formatCurrency(camp.spent)}
                              </td>
                              <td className="py-4 px-6 text-center text-sm font-semibold text-gray-300">
                                {camp.impressions.toLocaleString()}
                              </td>
                              <td className="py-4 px-6 text-center text-sm">
                                <div className="text-gray-100 font-semibold">{camp.clicks.toLocaleString()}</div>
                                <div className="text-xs text-[#4DB3FF]/70 mt-0.5">({ctr}%)</div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${camp.status === "ACTIVE"
                                    ? "bg-green-900/40 text-green-400 border border-green-700/30"
                                    : camp.status === "PAUSED"
                                      ? "bg-amber-900/40 text-amber-400 border border-amber-700/30"
                                      : camp.status === "PENDING_REVIEW"
                                        ? "bg-blue-950/40 text-[#4DB3FF] border border-[#4DB3FF]/30"
                                        : "bg-gray-800 text-gray-400 border border-gray-700/30"
                                  }`}>
                                  {camp.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                {camp.status !== "COMPLETED" && camp.status !== "CANCELLED" && camp.status !== "PENDING_REVIEW" && (
                                  <button
                                    onClick={() => handleToggleStatus(camp.id)}
                                    className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-semibold text-white transition-colors cursor-pointer active:scale-95"
                                  >
                                    {camp.status === "ACTIVE" ? "Pause" : "Resume"}
                                  </button>
                                )}
                                {camp.status === "PENDING_REVIEW" && (
                                  <span className="text-xs text-gray-500 italic">Reviewing...</span>
                                )}
                                {camp.status === "COMPLETED" && (
                                  <span className="text-xs text-gray-500">Completed</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* Tab Content 2: Wallet Transaction Ledger */
              <div className="w-full rounded-[12px] p-[1px] bg-gradient-to-br from-white/10 to-[#0c0d0d] shadow-2xl">
                <div className="bg-[#0A0A23] rounded-[10px] overflow-hidden">
                  <div className="p-5 border-b border-gray-800/80 flex justify-between items-center">
                    <h3 className="text-white text-lg font-bold tracking-wider">Transaction Ledger</h3>
                    <span className="text-gray-400 text-sm">Promo funds statement</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                      <thead className="bg-[#020216] text-gray-400 text-xs uppercase tracking-widest border-b border-gray-800/80">
                        <tr>
                          <th className="py-4 px-6">Date</th>
                          <th className="py-4 px-6">Type</th>
                          <th className="py-4 px-6">Description</th>
                          <th className="py-4 px-6 text-right">Amount (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50 text-sm">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-900/30 transition-colors">
                            <td className="py-4 px-6 text-gray-400 font-mono">
                              {tx.date}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tx.type === "DEPOSIT"
                                  ? "bg-green-950/40 text-green-400 border border-green-700/30"
                                  : "bg-red-950/40 text-red-400 border border-red-700/30"
                                }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-200">
                              {tx.description}
                            </td>
                            <td className={`py-4 px-6 text-right font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"
                              }`}>
                              {tx.amount > 0 ? `+${formatCurrency(tx.amount)}` : `${formatCurrency(tx.amount)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* 4. Campaign Creator Screen */
          <motion.div
            key="create-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Creator Form - Left Column (7 cols) */}
            <form onSubmit={handleCreateSubmit} className="lg:col-span-7 bg-[#0A0A23] rounded-xl border border-gray-800/80 p-6 space-y-6">
              <h3 className="text-white text-xl font-bold tracking-wider pb-3 border-b border-gray-800/80">Configure Campaign Details</h3>

              {/* Destination Link */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-1">Destination Target Page *</label>
                <p className="text-xs text-gray-400 mb-2">Users will navigate here when clicking the promotion.</p>
                <select
                  required
                  value={form.destinationLink}
                  onChange={handleDestinationChange}
                  className="w-full bg-[#020216] border border-gray-700 rounded-lg py-2.5 px-4 text-white outline-none focus:outline-none focus:ring-0 focus:border-[#4DB3FF] transition-all text-sm font-jura cursor-pointer"
                >
                  <option value="">Select Promotion Target</option>
                  <option value="/song/not-today-123">Song: Not Today (Single)</option>
                  <option value="/album/spring-day-789">Album: Spring Day (LP)</option>
                  <option value="/artist/profile">My Artist Profile Page</option>
                </select>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autumn Beats Boost"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#020216] border border-gray-700 rounded-lg py-2.5 px-4 text-white outline-none focus:outline-none focus:ring-0 focus:border-[#4DB3FF] transition-all text-sm font-jura"
                />
              </div>

              {/* Ad Type Toggle Buttons */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Ad Format *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: "banner", assetFile: null, assetPreviewUrl: "" }))}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border text-sm font-bold tracking-wider transition-all cursor-pointer active:scale-95 ${form.type === "banner"
                        ? "bg-[#0f3272]/30 border-[#4DB3FF] text-[#4DB3FF] shadow-md shadow-[#4DB3FF]/10"
                        : "bg-[#020216] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300"
                      }`}
                  >
                    <MdImage className="text-xl" />
                    Display Banner Ad
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: "featured", assetFile: null, assetPreviewUrl: "" }))}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border text-sm font-bold tracking-wider transition-all cursor-pointer active:scale-95 ${form.type === "featured"
                        ? "bg-[#0f3272]/30 border-[#4DB3FF] text-[#4DB3FF] shadow-md shadow-[#4DB3FF]/10"
                        : "bg-[#020216] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300"
                      }`}
                  >
                    <MdStar className="text-xl" />
                    Featured Priority Placement
                  </button>
                </div>
              </div>

              {/* Targeting */}
              <div className="space-y-4">
                <label className="block text-gray-300 text-sm font-semibold">Audience Targeting</label>

                <div className="flex gap-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="targeting"
                      checked={form.targetType === "general"}
                      onChange={() => setForm(prev => ({ ...prev, targetType: "general" }))}
                      className="form-radio text-[#3380FF] focus:ring-[#4DB3FF] bg-[#020216] border-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-300">General (Wide Reach)</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="targeting"
                      checked={form.targetType === "genre"}
                      onChange={() => setForm(prev => ({ ...prev, targetType: "genre" }))}
                      className="form-radio text-[#3380FF] focus:ring-[#4DB3FF] bg-[#020216] border-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-300">Target Specific Genres</span>
                  </label>
                </div>

                {form.targetType === "genre" && (
                  <div className="bg-[#020216] p-4 rounded-lg border border-gray-800">
                    <span className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Select Target Genres:</span>
                    <div className="flex flex-wrap gap-2">
                      {availableGenres.map(genre => {
                        const selected = form.genres.includes(genre);
                        return (
                          <button
                            type="button"
                            key={genre}
                            onClick={() => toggleGenre(genre)}
                            className={`text-xs font-semibold py-1.5 px-3 rounded-full border transition-all cursor-pointer ${selected
                                ? "bg-[#3380FF] border-[#4DB3FF] text-white"
                                : "bg-gray-900 border-gray-700 text-gray-400 hover:text-gray-300"
                              }`}
                          >
                            {genre}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 text-xs mb-1 font-semibold uppercase tracking-wider">Target Cities / Regions</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Delhi, Bengaluru (Leave blank for nationwide)"
                    value={form.regions}
                    onChange={(e) => setForm(prev => ({ ...prev, regions: e.target.value }))}
                    className="w-full bg-[#020216] border border-gray-700 rounded-lg py-2 px-4 text-white outline-none focus:outline-none focus:ring-0 focus:border-[#4DB3FF] transition-all text-xs font-jura"
                  />
                </div>
              </div>

              {/* Budgeting & Scheduling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Budget Config *</label>
                  <div className="flex gap-2">
                    <select
                      value={form.budgetType}
                      onChange={(e) => setForm(prev => ({ ...prev, budgetType: e.target.value }))}
                      className="bg-[#020216] border border-gray-700 rounded-lg py-2.5 px-3 text-white outline-none focus:outline-none focus:ring-0 focus:border-[#4DB3FF] text-sm font-jura cursor-pointer"
                    >
                      <option value="daily">Daily Limit</option>
                      <option value="lifetime">Total Limit</option>
                    </select>
                    <input
                      type="number"
                      required
                      min="5"
                      step="0.01"
                      placeholder="Min $5.00"
                      value={form.budgetLimit}
                      onChange={(e) => setForm(prev => ({ ...prev, budgetLimit: e.target.value }))}
                      className="w-full bg-[#020216] border border-gray-700 rounded-lg py-2.5 px-4 text-white outline-none focus:outline-none focus:ring-0 focus:border-[#4DB3FF] transition-all text-sm font-jura"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Duration Schedule *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="bg-[#020216] border border-gray-700 rounded-lg py-2.5 px-2 text-white outline-none focus:outline-none focus:ring-0 focus:border-[#4DB3FF] text-xs font-jura cursor-pointer"
                      style={{ colorScheme: "dark" }}
                    />
                    <input
                      type="date"
                      required
                      value={form.endDate}
                      onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="bg-[#020216] border border-gray-700 rounded-lg py-2.5 px-2 text-white outline-none focus:outline-none focus:ring-0 focus:border-[#4DB3FF] text-xs font-jura cursor-pointer"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
              </div>

              {/* Asset Drag & Drop / Upload Area */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Ad Asset Upload * ({form.type === "featured" ? "Promotional Cover Artwork" : "Banner Image JPG/PNG, 728x90"})
                </label>

                <div className="relative border-2 border-dashed border-gray-700 hover:border-[#4DB3FF]/50 rounded-xl p-6 bg-[#020216] text-center transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="flex flex-col items-center justify-center space-y-2">
                    <MdCloudUpload className="text-4xl text-gray-500" />
                    <p className="text-gray-300 text-sm font-semibold">
                      {form.assetFile ? form.assetFile.name : "Drag and drop or click to upload file"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Supported visual formats: .png, .jpg (Artwork dimensions)
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Reservation Alert Card */}
              <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4 flex gap-3 text-gray-300 text-xs items-center justify-between">
                <div className="flex gap-2.5 items-center">
                  <MdAccountBalanceWallet className="text-xl text-[#4DB3FF]" />
                  <div>
                    <span className="font-bold text-white block">Deducting from Promotion Wallet</span>
                    Available Wallet Balance: <span className="text-[#4DB3FF] font-bold">{formatCurrency(walletBalance)}</span>
                  </div>
                </div>
                {form.budgetLimit && parseFloat(form.budgetLimit) > walletBalance && (
                  <span className="text-red-400 font-bold uppercase tracking-wide animate-pulse">Insufficient Funds</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-800/80">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer text-sm font-semibold active:scale-95"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={form.budgetLimit && parseFloat(form.budgetLimit) > walletBalance}
                  className={`px-8 py-2.5 rounded-lg text-white font-bold tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-sm active:scale-95 ${(form.budgetLimit && parseFloat(form.budgetLimit) > walletBalance)
                      ? "bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed"
                      : ""
                    }`}
                  style={{
                    background: !(form.budgetLimit && parseFloat(form.budgetLimit) > walletBalance) ? "linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)" : "none",
                    border: !(form.budgetLimit && parseFloat(form.budgetLimit) > walletBalance) ? "1px solid rgba(77, 179, 255, 0.4)" : "none"
                  }}
                >
                  {form.budgetLimit && parseFloat(form.budgetLimit) > walletBalance
                    ? "Insufficient Wallet Balance"
                    : "Launch via Wallet Balance"}
                </button>
              </div>

            </form>

            {/* Ad Real-time Preview Area - Right Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
              <h3 className="text-white text-lg font-bold tracking-wider">Live Ad Preview</h3>

              {form.type === "featured" ? (
                /* Featured Content Search Boost Mockup Card */
                <div
                  className="rounded-2xl p-6 relative overflow-hidden shadow-2xl border transition-all"
                  style={{
                    background: "rgba(2, 2, 22, 0.25)",
                    backdropFilter: "blur(44px)",
                    WebkitBackdropFilter: "blur(44px)",
                    borderColor: "rgba(77, 179, 255, 0.3)"
                  }}
                >
                  <span className="px-3 py-1 bg-yellow-950/40 text-yellow-400 text-[10px] font-bold tracking-widest rounded-full uppercase border border-yellow-700/20 mb-4 inline-block">
                    Search Boost Priority Placement
                  </span>

                  <p className="text-gray-400 text-xs mb-4">Your track appears highlighted at the very top of user search results & home recommendations:</p>

                  {/* Mock Search Results Screen */}
                  <div className="bg-[#0E1525] rounded-xl border border-gray-800 p-4 space-y-3 font-sans">
                    <div className="w-full bg-[#020216] border border-gray-800 rounded-md py-1.5 px-3 flex items-center justify-between text-xs text-gray-500">
                      <span>🔍 Search tracks, artists...</span>
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#4DB3FF] mt-2">Sponsored Placement</div>

                    {/* Promoted Row #1 */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-[#3380FF]/15 to-[#020216] border border-[#4DB3FF]/30 p-2.5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#020216] border border-gray-800 flex items-center justify-center text-white overflow-hidden">
                          {form.assetPreviewUrl ? (
                            <img src={form.assetPreviewUrl} alt="Art Preview" className="w-full h-full object-cover" />
                          ) : (
                            <MdStar className="text-yellow-400 text-xl animate-pulse" />
                          )}
                        </div>
                        <div>
                          <div className="text-white text-xs font-bold">{form.name || "My Promoted Release"}</div>
                          <div className="text-[9px] text-[#4DB3FF]/80 mt-0.5">Featured Placement</div>
                        </div>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-white px-2 py-0.5 bg-[#3380FF] rounded">
                        Promoted
                      </span>
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-4">Organic Results</div>

                    {/* Organic Row #2 */}
                    <div className="flex items-center justify-between bg-[#020216]/50 p-2 rounded-lg opacity-40">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#0E1525] border border-gray-800"></div>
                        <div>
                          <div className="text-white text-[10px] font-bold">Standard Unpromoted Track</div>
                          <div className="text-[8px] text-gray-500 mt-0.5">Album release</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Promotion target */}
                  <div className="mt-8 pt-6 border-t border-gray-800/80 w-full">
                    <span className="text-xs text-gray-500 uppercase tracking-widest block mb-2 font-semibold">Promotion target</span>
                    <div className="bg-[#020216] border border-gray-800 rounded-lg p-3 text-xs text-[#4DB3FF] font-semibold truncate">
                      {form.destinationLink || "Select a target link above"}
                    </div>
                  </div>
                </div>
              ) : (
                /* Banner Ad Glassmorphism Card */
                <div
                  className="rounded-2xl p-6 relative overflow-hidden shadow-2xl border transition-all"
                  style={{
                    background: "rgba(2, 2, 22, 0.25)",
                    backdropFilter: "blur(44px)",
                    borderColor: "rgba(77, 179, 255, 0.3)"
                  }}
                >
                  <span className="inline-block px-3 py-1 bg-emerald-950/40 text-emerald-400 text-[10px] font-bold tracking-widest rounded-full uppercase border border-emerald-700/20 mb-4">
                    Sponsored Display Banner
                  </span>

                  <p className="text-gray-400 text-xs mb-3">Below is how your banner ad appears inside user dashboard and search lists:</p>

                  {/* Main Leaderboard Banner Preview Box */}
                  <div className="w-full aspect-[728/90] rounded-lg border border-gray-800 bg-gradient-to-r from-[#0E1525] to-black flex items-center justify-between p-4 relative overflow-hidden">

                    {form.assetPreviewUrl ? (
                      <img
                        src={form.assetPreviewUrl}
                        alt="Banner Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1d] via-[#122340] to-black opacity-40"></div>
                    )}

                    <div className="relative z-10 flex items-center gap-3">
                      {/* Tiny Artist Thumb */}
                      <div className="w-8 h-8 rounded bg-[#3380FF]/30 border border-[#4DB3FF]/40 flex items-center justify-center text-white text-[10px] font-bold">
                        AD
                      </div>
                      <div>
                        <div className="text-white text-xs font-bold tracking-wide">
                          {form.name || "Promoted Song/Album Name"}
                        </div>
                        <div className="text-gray-400 text-[9px] mt-0.5 font-semibold">Sponsored Release</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="relative z-10 text-[9px] uppercase font-bold tracking-wider text-white px-3 py-1.5 rounded bg-[#3380FF] hover:bg-[#3380FF]/80 transition-colors pointer-events-none"
                    >
                      Listen Now
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-800/80 w-full">
                    <span className="text-xs text-gray-500 uppercase tracking-widest block mb-2 font-semibold">Promotion target</span>
                    <div className="bg-[#020216] border border-gray-800 rounded-lg p-3 text-xs text-[#4DB3FF] font-semibold truncate">
                      {form.destinationLink || "Select a target link above"}
                    </div>
                  </div>
                </div>
              )}

              {/* General Info Card */}
              <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4 flex gap-3 text-gray-400 text-xs leading-relaxed">
                <MdInfo className="text-2xl text-[#4DB3FF] flex-shrink-0" />
                <div>
                  <strong className="text-white block mb-1">Prepaid Wallet Policy</strong>
                  Campaign budgets are reserved from your promotion wallet immediately upon submission. Admin reviews will complete within 24 hours. If your campaign is rejected, the reserved budget is automatically refunded to your wallet balance.
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Glowing Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleTopUpSubmit}
            className="w-full max-w-md bg-[#0A0A23] rounded-2xl border border-[#4DB3FF]/40 p-6 space-y-6 shadow-2xl relative"
          >
            <div>
              <h3 className="text-white text-lg font-bold tracking-wider flex items-center gap-2">
                <MdAccountBalanceWallet className="text-[#4DB3FF]" />
                Top Up Promotion Wallet
              </h3>
              <p className="text-gray-400 text-xs mt-1">Load prepaid funds onto your workspace wallet using Stripe.</p>
            </div>

            {/* Wallet Info Display */}
            <div className="bg-[#020216] border border-gray-800 p-4 rounded-xl flex justify-between items-center text-sm">
              <span className="text-gray-400">Current Balance:</span>
              <span className="text-white font-extrabold text-[#4DB3FF]">{formatCurrency(walletBalance)}</span>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Select / Enter Amount *</label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[50, 100, 250].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(String(amt))}
                    className={`py-2 text-sm font-semibold rounded border transition-all cursor-pointer ${topUpAmount === String(amt)
                        ? "bg-[#3380FF] border-[#4DB3FF] text-white"
                        : "bg-[#020216] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300"
                      }`}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">$</span>
                <input
                  type="number"
                  required
                  min="10"
                  placeholder="Custom Amount (Min $10.00)"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-[#020216] border border-gray-700 rounded-lg py-2.5 pl-8 pr-4 text-white outline-none focus:outline-none focus:ring-0 focus:border-[#4DB3FF] transition-all text-sm font-jura"
                />
              </div>
            </div>

            {/* Payment Summary */}
            {topUpAmount && !isNaN(parseFloat(topUpAmount)) && parseFloat(topUpAmount) > 0 && (
              <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-gray-800/80">
                <div className="flex justify-between">
                  <span>Top-Up Amount:</span>
                  <span className="text-white font-bold">{formatCurrency(parseFloat(topUpAmount))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processor Fee (Stripe):</span>
                  <span className="text-white">Included</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-800/50 pt-1 mt-1 text-gray-300">
                  <span>Total Charges:</span>
                  <span className="text-[#4DB3FF] font-extrabold">{formatCurrency(parseFloat(topUpAmount))}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/80">
              <button
                type="button"
                onClick={() => {
                  if (!isProcessingTopUp) {
                    setShowTopUpModal(false);
                    setTopUpAmount("");
                  }
                }}
                disabled={isProcessingTopUp}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingTopUp || !topUpAmount || parseFloat(topUpAmount) < 10}
                className="px-6 py-2 rounded-lg bg-[#3380FF] hover:bg-[#3380FF]/80 text-white font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingTopUp ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing Checkout...
                  </>
                ) : (
                  <>
                    <MdPayment />
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdvertsComponent;
