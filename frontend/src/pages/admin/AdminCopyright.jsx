import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShieldAlt,
  FaSearch,
  FaCheckCircle,
  FaBan,
  FaSync,
  FaMusic,
  FaUser,
  FaExclamationTriangle,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaCode,
  FaTimes,
  FaCheck,
  FaClock,
  FaCopy,
  FaCheckDouble,
  FaFingerprint,
  FaFileAlt,
  FaBullseye,
  FaEllipsisV,
  FaChevronRight as FaArrowRight,
  FaVolumeUp,
} from 'react-icons/fa';
import { toast } from 'sonner';
import { adminCopyrightApi } from '../../api/adminCopyrightApi';

const AdminCopyright = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected song for right sidebar inspector
  const [selectedSong, setSelectedSong] = useState(null);
  const [sideTab, setSideTab] = useState('details'); // 'details' | 'audd' | 'history'

  // Stats calculation
  const [stats, setStats] = useState({
    total: 0,
    matches: 0,
    clean: 0,
    pending: 0,
  });

  // Action loaders
  const [scanningId, setScanningId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [takedownModal, setTakedownModal] = useState({
    isOpen: false,
    song: null,
    reason: '',
    loading: false,
  });

  const [copiedId, setCopiedId] = useState(null);
  const debounceTimer = useRef(null);

  const takedownPresets = [
    'Commercial copyright match detected via AudD database',
    'Unlicensed copyrighted master/sample detected',
    'Direct DMCA infringement claim received',
    'Unauthorized cover / bootleg release',
  ];

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '3:42';
    const num = Number(seconds);
    if (isNaN(num)) return '3:42';
    const mins = Math.floor(num / 60);
    const secs = Math.floor(num % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminCopyrightApi.getUnverifiedSongs({
        page,
        limit,
        statusFilter,
        search,
      });

      if (res.success) {
        const fetchedSongs = res.data || [];
        setSongs(fetchedSongs);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);

        setStats({
          total: res.total || 0,
          matches: fetchedSongs.filter((s) => s.copyrightCheck?.status === 'match_found').length,
          clean: fetchedSongs.filter((s) => s.copyrightCheck?.status === 'clean').length,
          pending: fetchedSongs.filter(
            (s) => !s.copyrightCheck?.status || s.copyrightCheck?.status === 'pending'
          ).length,
        });

        // Set initial selected song if not already set or updated
        if (fetchedSongs.length > 0) {
          setSelectedSong((prev) => {
            if (!prev) return fetchedSongs[0];
            const updated = fetchedSongs.find((s) => s._id === prev._id);
            return updated || fetchedSongs[0];
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, search]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handleScan = async (songId) => {
    try {
      setScanningId(songId);
      toast.info('Running AudD acoustic recognition scan...');
      const res = await adminCopyrightApi.scanSong(songId);

      if (res.success) {
        const check = res.data;
        if (check?.status === 'match_found') {
          toast.warning(`Match Found: "${check.matchedTitle}" by ${check.matchedArtist}`);
        } else if (check?.status === 'clean') {
          toast.success('AudD Scan: Clean track (no commercial match found)');
        } else if (check?.status === 'error') {
          toast.error(`Scan notice: ${check.rawResponse?.error || 'Scan incomplete'}`);
        } else {
          toast.success('AudD Scan completed');
        }
        await fetchSongs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Scan failed');
    } finally {
      setScanningId(null);
    }
  };

  const handleVerify = async (songId) => {
    try {
      setVerifyingId(songId);
      const res = await adminCopyrightApi.verifySong(songId);
      if (res.success) {
        toast.success(`Track "${res.data?.title || ''}" verified and published`);
        await fetchSongs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const openTakedownModal = (song) => {
    const defaultReason =
      song.copyrightCheck?.status === 'match_found'
        ? `Commercial copyright match found on AudD ("${song.copyrightCheck.matchedTitle}" by ${song.copyrightCheck.matchedArtist})`
        : takedownPresets[0];

    setTakedownModal({
      isOpen: true,
      song,
      reason: defaultReason,
      loading: false,
    });
  };

  const handleConfirmTakedown = async () => {
    if (!takedownModal.song) return;
    try {
      setTakedownModal((prev) => ({ ...prev, loading: true }));
      const res = await adminCopyrightApi.takedownSong(
        takedownModal.song._id,
        takedownModal.reason
      );
      if (res.success) {
        toast.success(`Track "${res.data?.title || ''}" taken down and unpublished`);
        setTakedownModal({ isOpen: false, song: null, reason: '', loading: false });
        await fetchSongs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Takedown failed');
      setTakedownModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCopyJson = (id, data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    toast.success('AudD raw response copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs = [
    { label: 'All Unverified', value: '' },
    { label: 'Match Found', value: 'match_found' },
    { label: 'Clean Scans', value: 'clean' },
    { label: 'Pending Scan', value: 'pending' },
    { label: 'Taken Down', value: 'takedown' },
  ];

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-10 space-y-5">
      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unverified Queue */}
        <div className="bg-[#0b101d]/90 border border-white/[0.07] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              UNVERIFIED QUEUE
            </div>
            <div className="text-2xl font-bold text-white mt-1.5">{totalCount}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-white/[0.08] flex items-center justify-center text-slate-400">
            <FaFileAlt className="text-xs" />
          </div>
        </div>

        {/* Matches Found */}
        <div className="bg-[#0b101d]/90 border border-white/[0.07] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
              MATCHES FOUND
            </div>
            <div className="text-2xl font-bold text-rose-400 mt-1.5">{stats.matches}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <FaBullseye className="text-xs" />
          </div>
        </div>

        {/* AuDD Clean */}
        <div className="bg-[#0b101d]/90 border border-white/[0.07] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              AuDD CLEAN
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1.5">{stats.clean}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FaCheckCircle className="text-xs" />
          </div>
        </div>

        {/* Pending Scan */}
        <div className="bg-[#0b101d]/90 border border-white/[0.07] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              PENDING SCAN
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1.5">{stats.pending}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FaClock className="text-xs" />
          </div>
        </div>
      </div>

      {/* Main Split Layout: Table on Left + Inspector Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: High-density Data Table (col-span-8 or 12) */}
        <div
          className={`${
            selectedSong ? 'lg:col-span-8' : 'lg:col-span-12'
          } bg-[#0b101d]/90 border border-white/[0.07] rounded-xl p-4 space-y-4 shadow-md transition-all duration-300`}
        >
          {/* Toolbar: Filter Tabs + Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none bg-[#070b14] p-1 rounded-lg border border-white/[0.06]">
              {tabs.map((tab) => {
                const isActive = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleFilterChange(tab.value)}
                    className="relative px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors select-none focus:outline-none"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCopyrightTabPill"
                        className="absolute inset-0 bg-[#162138] rounded-md border border-white/[0.12] shadow-sm"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-150 ${
                        isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px] md:w-72">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search by track title, artist or album..."
                className="w-full bg-[#070b14] border border-white/[0.08] rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-white/[0.06] rounded-xl bg-[#070b14]/50">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 font-semibold text-xs uppercase tracking-wider bg-[#0a0f1c]">
                  <th className="py-3 px-3.5">TRACK</th>
                  <th className="py-3 px-3.5">ARTIST</th>
                  <th className="py-3 px-3.5">ALBUM</th>
                  <th className="py-3 px-3.5">DATE ADDED</th>
                  <th className="py-3 px-3.5">STATUS</th>
                  <th className="py-3 px-3.5 text-center">ACTIONS</th>
                  <th className="py-3 px-2 w-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                      <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-blue-400" />
                      <span>Loading queue tracks...</span>
                    </td>
                  </tr>
                ) : songs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-500 text-sm">
                      No tracks found matching current filter.
                    </td>
                  </tr>
                ) : (
                  songs.map((song) => {
                    const isSelected = selectedSong?._id === song._id;
                    const check = song.copyrightCheck || {};
                    const status = check.status || 'pending';
                    const isMatch = status === 'match_found';
                    const isClean = status === 'clean';
                    const isPending = status === 'pending';
                    const isTakedown = status === 'takedown';

                    return (
                      <tr
                        key={song._id}
                        onClick={() => setSelectedSong(song)}
                        className={`cursor-pointer transition-colors group ${
                          isSelected
                            ? 'bg-[#131f38] text-white'
                            : 'hover:bg-[#0e1628] text-slate-300'
                        }`}
                      >
                        {/* Track: Cover + Title + Duration */}
                        <td className="py-2.5 px-3.5 min-w-[190px]">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                song.coverImageUrl ||
                                song.album?.coverImageUrl ||
                                '/images/default-album.jpg'
                              }
                              alt={song.title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-white/[0.08] shadow-sm flex-shrink-0"
                              onError={(e) => {
                                e.target.src =
                                  'https://placehold.co/80x80/111827/9ca3af?text=Track';
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-white text-sm leading-tight truncate">
                                {song.title}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {formatDuration(song.duration)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Artist */}
                        <td className="py-2.5 px-3.5">
                          <span className="text-slate-200 font-medium text-sm">
                            {song.artist?.name || 'Unknown'}
                          </span>
                        </td>

                        {/* Album */}
                        <td className="py-2.5 px-3.5 text-slate-400 text-sm">
                          {song.album?.title || 'Single'}
                        </td>

                        {/* Date Added */}
                        <td className="py-2.5 px-3.5 text-slate-400 whitespace-nowrap text-xs">
                          {formatDate(song.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          {isMatch && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Match Found
                            </span>
                          )}
                          {isClean && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              AudD Clean
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending Scan
                            </span>
                          )}
                          {isTakedown && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              Taken Down
                            </span>
                          )}
                          {!isMatch && !isClean && !isPending && !isTakedown && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              Unverified
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-2.5 px-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Scan Button */}
                            <button
                              onClick={() => handleScan(song._id)}
                              disabled={scanningId === song._id || verifyingId === song._id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-[#162138] hover:bg-[#202f50] text-slate-200 border border-white/[0.08] rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                              title="Scan with AudD"
                            >
                              <FaFingerprint className="text-[11px]" />
                              <span>Scan</span>
                            </button>

                            {/* Takedown Button */}
                            <button
                              onClick={() => openTakedownModal(song)}
                              disabled={scanningId === song._id || verifyingId === song._id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                              title="Takedown Track"
                            >
                              <FaBan className="text-[11px]" />
                              <span>Takedown</span>
                            </button>

                            {/* Verify Button */}
                            <button
                              onClick={() => handleVerify(song._id)}
                              disabled={scanningId === song._id || verifyingId === song._id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                              title="Verify & Publish Track"
                            >
                              <FaCheck className="text-[11px]" />
                              <span>Verify</span>
                            </button>
                          </div>
                        </td>

                        {/* Arrow Right */}
                        <td className="py-2.5 px-2 text-right">
                          <FaArrowRight
                            className={`text-xs transition-transform ${
                              isSelected ? 'text-blue-400 translate-x-0.5' : 'text-slate-600'
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
            {/* Limit Selector */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-[#070b14] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs text-white appearance-none pr-6 focus:outline-none focus:border-blue-500"
                >
                  <option value={12}>12</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-slate-500" />
              </div>
              <span>
                Showing {songs.length > 0 ? (page - 1) * limit + 1 : 0}-
                {Math.min(page * limit, totalCount)} of {totalCount} tracks
              </span>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1.5 bg-[#070b14] hover:bg-[#162138] border border-white/[0.08] rounded-md disabled:opacity-30 text-white"
              >
                <FaChevronLeft className="text-[10px]" />
              </button>

              <span className="w-7 h-7 flex items-center justify-center bg-blue-600 font-bold text-white rounded-md text-xs">
                {page}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-1.5 bg-[#070b14] hover:bg-[#162138] border border-white/[0.08] rounded-md disabled:opacity-30 text-white"
              >
                <FaChevronRight className="text-[10px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Track Inspector Sidebar (col-span-4) */}
        {selectedSong && (
          <div className="lg:col-span-4 bg-[#0b101d]/90 border border-white/[0.07] rounded-xl p-5 space-y-4 shadow-lg sticky top-6">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedSong.coverImageUrl ||
                    selectedSong.album?.coverImageUrl ||
                    '/images/default-album.jpg'
                  }
                  alt={selectedSong.title}
                  className="w-14 h-14 rounded-lg object-cover bg-slate-950 border border-white/[0.08] flex-shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/96x96/111827/9ca3af?text=Track';
                  }}
                />
                <div>
                  <h3 className="font-bold text-sm text-white leading-snug">
                    {selectedSong.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    {selectedSong.artist?.name || 'Unknown Artist'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedSong.album?.title || 'Single'} • {formatDate(selectedSong.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSong(null)}
                className="text-slate-500 hover:text-white p-1"
                title="Close Inspector"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleScan(selectedSong._id)}
                  disabled={scanningId === selectedSong._id}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#162138] hover:bg-[#202f50] border border-white/[0.08] rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {scanningId === selectedSong._id ? (
                    <FaSpinner className="animate-spin text-xs" />
                  ) : (
                    <FaFingerprint className="text-xs" />
                  )}
                  <span>Scan with AuD</span>
                </button>

                <button
                  onClick={() => openTakedownModal(selectedSong)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 rounded-lg text-xs font-semibold text-rose-300 transition-colors"
                >
                  <FaBan className="text-xs" />
                  <span>Takedown</span>
                </button>
              </div>

              <button
                onClick={() => handleVerify(selectedSong._id)}
                disabled={verifyingId === selectedSong._id}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg text-xs font-bold text-white transition-colors shadow-md disabled:opacity-50"
              >
                {verifyingId === selectedSong._id ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <FaCheck className="text-xs" />
                )}
                <span>Verify &amp; Publish</span>
              </button>
            </div>

            {/* Sub-Tabs: Details, AuD Results, History */}
            <div className="flex border-b border-white/[0.06] text-xs">
              {[
                { label: 'Details', value: 'details' },
                { label: 'AuD Results', value: 'audd' },
                { label: 'History', value: 'history' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSideTab(tab.value)}
                  className={`pb-2 px-3 font-medium transition-colors border-b-2 -mb-[1px] ${
                    sideTab === tab.value
                      ? 'border-blue-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Details */}
            {sideTab === 'details' && (
              <div className="space-y-4 text-xs">
                {/* Audio Player */}
                <div className="bg-[#070b14] p-3 rounded-lg border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <FaMusic className="text-blue-400 text-[10px]" /> Audio Player
                    </span>
                    <span className="text-slate-500">
                      {formatDuration(selectedSong.duration)}
                    </span>
                  </div>
                  {selectedSong.audioUrl ? (
                    <audio
                      controls
                      src={selectedSong.audioUrl}
                      className="w-full h-8 outline-none rounded"
                      preload="none"
                    />
                  ) : (
                    <div className="text-[11px] text-slate-500 italic py-1">
                      No audio stream available
                    </div>
                  )}
                </div>

                {/* Track Information Table */}
                <div className="bg-[#070b14] p-3 rounded-lg border border-white/[0.06] space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pb-1 border-b border-white/[0.04]">
                    <FaUser className="text-blue-400 text-[10px]" /> Track Information
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Title</span>
                      <span className="text-white font-medium">{selectedSong.title}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Artist</span>
                      <span className="text-white">{selectedSong.artist?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Album</span>
                      <span className="text-white">{selectedSong.album?.title || 'Single'}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Duration</span>
                      <span className="text-white">
                        {formatDuration(selectedSong.duration)}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Date Added</span>
                      <span className="text-white">{formatDate(selectedSong.createdAt)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Track ID</span>
                      <span className="font-mono text-slate-300 text-[10px]">
                        {selectedSong._id.substring(0, 16)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acoustic Recognition Details Box */}
                <div className="bg-[#070b14] p-3 rounded-lg border border-white/[0.06] space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pb-1 border-b border-white/[0.04]">
                    <FaFingerprint className="text-blue-400 text-[10px]" /> Acoustic Recognition
                    Details
                  </div>

                  {selectedSong.copyrightCheck?.status === 'match_found' ? (
                    <div className="space-y-1.5 text-rose-300 text-[11px]">
                      <p>
                        ⚠️ <strong>Matched Title:</strong>{' '}
                        {selectedSong.copyrightCheck.matchedTitle || 'N/A'}
                      </p>
                      <p>
                        👤 <strong>Matched Artist:</strong>{' '}
                        {selectedSong.copyrightCheck.matchedArtist || 'N/A'}
                      </p>
                      {selectedSong.copyrightCheck.matchedIsrc && (
                        <p>
                          🔤 <strong>ISRC:</strong>{' '}
                          <code className="bg-black/50 px-1 py-0.5 rounded text-rose-300 font-mono">
                            {selectedSong.copyrightCheck.matchedIsrc}
                          </code>
                        </p>
                      )}
                    </div>
                  ) : selectedSong.copyrightCheck?.status === 'clean' ? (
                    <p className="text-emerald-400 text-[11px] leading-relaxed">
                      ✅ Track fingerprint is clean. No matching commercial catalog matches on
                      Spotify / Apple Music.
                    </p>
                  ) : (
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Acoustic fingerprint scan not initiated yet. Click &quot;Scan with AuD&quot; to
                      analyze this track.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: AuD Results */}
            {sideTab === 'audd' && (
              <div className="space-y-3 text-xs">
                {selectedSong.copyrightCheck?.rawResponse ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-semibold">Raw JSON Payload</span>
                      <button
                        onClick={() =>
                          handleCopyJson(
                            selectedSong._id,
                            selectedSong.copyrightCheck.rawResponse
                          )
                        }
                        className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
                      >
                        {copiedId === selectedSong._id ? (
                          <FaCheckDouble className="text-emerald-400" />
                        ) : (
                          <FaCopy />
                        )}
                        <span>{copiedId === selectedSong._id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <pre className="p-3 bg-[#070b14] rounded-lg border border-white/[0.06] text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-72 scrollbar-thin">
                      {JSON.stringify(selectedSong.copyrightCheck.rawResponse, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No scan payload available. Run scan first.
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: History */}
            {sideTab === 'history' && (
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="p-2.5 bg-[#070b14] rounded-lg border border-white/[0.06] flex items-center justify-between">
                  <span>Track Uploaded</span>
                  <span className="text-[11px] text-slate-500">
                    {formatDate(selectedSong.createdAt)}
                  </span>
                </div>
                {selectedSong.copyrightCheck?.checkedAt && (
                  <div className="p-2.5 bg-[#070b14] rounded-lg border border-white/[0.06] flex items-center justify-between">
                    <span>AudD Scan Checked</span>
                    <span className="text-[11px] text-slate-500">
                      {formatDate(selectedSong.copyrightCheck.checkedAt)}
                    </span>
                  </div>
                )}
                {selectedSong.verifiedAt && (
                  <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-center justify-between text-emerald-300">
                    <span>Verified by Admin</span>
                    <span className="text-[11px]">{formatDate(selectedSong.verifiedAt)}</span>
                  </div>
                )}
                {selectedSong.takedownAt && (
                  <div className="p-2.5 bg-rose-950/20 border border-rose-500/20 rounded-lg flex items-center justify-between text-rose-300">
                    <span>Taken Down</span>
                    <span className="text-[11px]">{formatDate(selectedSong.takedownAt)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Takedown Modal */}
      {takedownModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e1628] border border-rose-500/30 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <FaBan className="text-sm" />
                <span>Confirm Content Takedown</span>
              </div>
              <button
                onClick={() =>
                  setTakedownModal({ isOpen: false, song: null, reason: '', loading: false })
                }
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <FaTimes />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              You are unpublishing and taking down{' '}
              <strong className="text-white">&quot;{takedownModal.song?.title}&quot;</strong> by{' '}
              <strong className="text-slate-200">
                {takedownModal.song?.artist?.name || 'Artist'}
              </strong>
              .
            </div>

            {/* Quick preset reasons */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Quick Preset Reasons:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {takedownPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setTakedownModal((prev) => ({ ...prev, reason: preset }))
                    }
                    className={`text-[10px] px-2.5 py-1 rounded-md border text-left transition-colors ${
                      takedownModal.reason === preset
                        ? 'bg-rose-950/60 border-rose-700 text-rose-200 font-medium'
                        : 'bg-[#070b14] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Takedown Notice / Reason:
              </label>
              <textarea
                rows={3}
                value={takedownModal.reason}
                onChange={(e) =>
                  setTakedownModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="w-full bg-[#070b14] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                placeholder="Enter specific violation or takedown explanation..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() =>
                  setTakedownModal({ isOpen: false, song: null, reason: '', loading: false })
                }
                disabled={takedownModal.loading}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTakedown}
                disabled={takedownModal.loading || !takedownModal.reason.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shadow-sm"
              >
                {takedownModal.loading ? (
                  <>
                    <FaSpinner className="animate-spin text-[10px]" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaBan className="text-[10px]" />
                    <span>Execute Takedown</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCopyright;
