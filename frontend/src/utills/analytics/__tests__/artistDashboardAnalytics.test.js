// src/utills/analytics/__tests__/artistDashboardAnalytics.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  formatCompactNumber,
  formatPercentage,
  formatCurrency,
  formatDollarAmount,
  formatDateLabel,
} from "../formatters.js";
import { artistAnalyticsApi } from "../../../api/artistAnalyticsApi.js";
import axiosInstance from "../../axiosInstance.js";
import { artistAnalyticsKeys } from "../../../hooks/api/useArtistAnalytics.js";

describe("Day 4: Artist Dashboard Integration & Analytics", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. Number & Metric Formatters", () => {
    describe("formatCompactNumber", () => {
      it("formats small and zero numbers accurately", () => {
        expect(formatCompactNumber(0)).toBe("0");
        expect(formatCompactNumber(1)).toBe("1");
        expect(formatCompactNumber(58)).toBe("58");
        expect(formatCompactNumber(999)).toBe("999");
      });

      it("formats thousands (K) correctly", () => {
        expect(formatCompactNumber(1000)).toBe("1K");
        expect(formatCompactNumber(1200)).toBe("1.2K");
        expect(formatCompactNumber(42300)).toBe("42.3K");
        expect(formatCompactNumber(100000)).toBe("100K");
        expect(formatCompactNumber(999900)).toBe("999.9K");
      });

      it("formats millions (M) correctly", () => {
        expect(formatCompactNumber(1000000)).toBe("1M");
        expect(formatCompactNumber(1500000)).toBe("1.5M");
        expect(formatCompactNumber(12400000)).toBe("12.4M");
      });

      it("formats billions (B) correctly", () => {
        expect(formatCompactNumber(2500000000)).toBe("2.5B");
      });

      it("gracefully handles null, undefined, and non-numeric inputs", () => {
        expect(formatCompactNumber(null)).toBe("0");
        expect(formatCompactNumber(undefined)).toBe("0");
        expect(formatCompactNumber("invalid")).toBe("0");
        expect(formatCompactNumber(NaN)).toBe("0");
      });
    });

    describe("formatPercentage", () => {
      it("formats integer percentages without unnecessary decimal points", () => {
        expect(formatPercentage(0)).toBe("0%");
        expect(formatPercentage(50)).toBe("50%");
        expect(formatPercentage(100)).toBe("100%");
      });

      it("formats decimal percentages with specified precision", () => {
        expect(formatPercentage(64.25)).toBe("64.3%");
        expect(formatPercentage(12.1)).toBe("12.1%");
      });

      it("handles null or undefined percentage values", () => {
        expect(formatPercentage(null)).toBe("0%");
        expect(formatPercentage(undefined)).toBe("0%");
      });
    });

    describe("formatCurrency", () => {
      it("formats cents into clean USD string", () => {
        expect(formatCurrency(0)).toBe("$0.00");
        expect(formatCurrency(50)).toBe("$0.50");
        expect(formatCurrency(2450)).toBe("$24.50");
        expect(formatCurrency(100000)).toBe("$1000.00");
      });

      it("preserves already formatted dollar strings", () => {
        expect(formatCurrency("$2.4k")).toBe("$2.4k");
        expect(formatCurrency("$45.00")).toBe("$45.00");
      });

      it("handles null and undefined currency gracefully", () => {
        expect(formatCurrency(null)).toBe("$0.00");
        expect(formatCurrency(undefined)).toBe("$0.00");
      });
    });

    describe("formatDollarAmount", () => {
      it("formats decimal dollar amounts into clean USD currency string", () => {
        expect(formatDollarAmount(0)).toBe("$0.00");
        expect(formatDollarAmount(17.55)).toBe("$17.55");
        expect(formatDollarAmount(19.55)).toBe("$19.55");
        expect(formatDollarAmount("1250.5")).toBe("$1,250.50");
      });

      it("handles null and undefined values safely", () => {
        expect(formatDollarAmount(null)).toBe("$0.00");
        expect(formatDollarAmount(undefined)).toBe("$0.00");
        expect(formatDollarAmount("abc")).toBe("$0.00");
      });
    });

    describe("formatDateLabel", () => {
      it("formats YYYY-MM-DD into short month and day", () => {
        expect(formatDateLabel("2026-10-26")).toBe("Oct 26");
        expect(formatDateLabel("2026-01-01")).toBe("Jan 1");
      });

      it("returns fallback for malformed date inputs", () => {
        expect(formatDateLabel("")).toBe("");
        expect(formatDateLabel(null)).toBe("");
      });
    });
  });

  describe("2. Artist Analytics API Client (Endpoints & Contracts)", () => {
    it("fetchArtistOverview calls GET /v1/analytics/artist/overview with correct range query", async () => {
      const mockOverviewData = {
        range: { startDate: "2026-09-27", endDate: "2026-10-26" },
        artist: { id: "artist_123", name: "Apex Artist", currentFollowers: 450 },
        traffic: { profileViews: 120, songViews: 350 },
        playback: {
          totalPlays: 2500,
          qualifiedPlays: 2100,
          completions: 1800,
          skips: 300,
          completionRate: 72,
          skipRate: 12,
        },
        audience: { newFollowers: 35, likes: 90 },
        monetization: { revenueCents: 4500, revenueFormatted: "$45.00" },
      };

      const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
        data: { success: true, data: mockOverviewData },
      });

      const result = await artistAnalyticsApi.fetchArtistOverview({ range: "30d" });

      expect(getSpy).toHaveBeenCalledWith("/v1/analytics/artist/overview", {
        params: { range: "30d" },
      });
      expect(result).toEqual(mockOverviewData);
      expect(result.playback.totalPlays).toBe(2500);
      expect(result.playback.completionRate).toBe(72);
    });

    it("fetchArtistOverview passes optional artistId parameter for admin persona", async () => {
      const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
        data: { success: true, data: {} },
      });

      await artistAnalyticsApi.fetchArtistOverview({
        range: "7d",
        artistId: "507f1f77bcf86cd799439011",
      });

      expect(getSpy).toHaveBeenCalledWith("/v1/analytics/artist/overview", {
        params: { range: "7d", artistId: "507f1f77bcf86cd799439011" },
      });
    });

    it("fetchArtistTimeseries calls GET /v1/analytics/artist/timeseries with range query", async () => {
      const mockTimeseriesData = {
        range: { startDate: "2026-10-20", endDate: "2026-10-26" },
        timeseries: [
          { date: "2026-10-20", plays: 15, qualifiedPlays: 12, completions: 10 },
          { date: "2026-10-21", plays: 22, qualifiedPlays: 18, completions: 15 },
        ],
      };

      const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
        data: { success: true, data: mockTimeseriesData },
      });

      const result = await artistAnalyticsApi.fetchArtistTimeseries({ range: "7d" });

      expect(getSpy).toHaveBeenCalledWith("/v1/analytics/artist/timeseries", {
        params: { range: "7d" },
      });
      expect(result.timeseries).toHaveLength(2);
      expect(result.timeseries[0].plays).toBe(15);
    });

    it("fetchArtistTopSongs calls GET /v1/analytics/artist/top-songs with limit, sortBy, and range", async () => {
      const mockTopSongsData = {
        range: { startDate: "2026-09-27", endDate: "2026-10-26" },
        songs: [
          {
            _id: "song_1",
            songId: "song_1",
            title: "Summer Vibes",
            plays: 1200,
            qualifiedPlays: 1000,
            completions: 800,
            completionRate: 66.67,
          },
        ],
      };

      const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
        data: { success: true, data: mockTopSongsData },
      });

      const result = await artistAnalyticsApi.fetchArtistTopSongs({
        range: "90d",
        limit: 5,
        sortBy: "completions",
      });

      expect(getSpy).toHaveBeenCalledWith("/v1/analytics/artist/top-songs", {
        params: { range: "90d", limit: 5, sortBy: "completions" },
      });
      expect(result.songs).toHaveLength(1);
      expect(result.songs[0].title).toBe("Summer Vibes");
    });

    it("fetchArtistFunnel calls GET /v1/analytics/funnel/:artistId with date filters", async () => {
      const mockFunnelData = {
        artistId: "artist_123",
        funnelCounts: {
          subscription_clicked: 40,
          checkout_started: 25,
          payment_initiated: 22,
          payment_completed: 18,
          subscription_activated: 18,
        },
        conversionRates: {
          overallConversionRate: 45,
        },
      };

      const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
        data: { success: true, data: mockFunnelData },
      });

      const result = await artistAnalyticsApi.fetchArtistFunnel({
        artistId: "artist_123",
        startDate: "2026-10-01",
        endDate: "2026-10-29",
      });

      expect(getSpy).toHaveBeenCalledWith("/v1/analytics/funnel/artist_123", {
        params: { startDate: "2026-10-01", endDate: "2026-10-29" },
      });
      expect(result.funnelCounts.subscription_clicked).toBe(40);
      expect(result.conversionRates.overallConversionRate).toBe(45);
    });
  });

  describe("3. React Query Keys & Range State Management", () => {
    it("generates distinct query keys for different ranges and artist identities", () => {
      const key7d = artistAnalyticsKeys.overview("7d", "artistA");
      const key30d = artistAnalyticsKeys.overview("30d", "artistA");
      const keyOtherArtist = artistAnalyticsKeys.overview("30d", "artistB");

      expect(key7d).not.toEqual(key30d);
      expect(key30d).not.toEqual(keyOtherArtist);
      expect(key7d).toContain("overview");
      expect(key7d).toContain("7d");
    });

    it("generates distinct query keys for topSongs sorting", () => {
      const keyPlays = artistAnalyticsKeys.topSongs("30d", "plays", 10);
      const keyCompletions = artistAnalyticsKeys.topSongs("30d", "completions", 10);

      expect(keyPlays).not.toEqual(keyCompletions);
      expect(keyPlays).toContain("plays");
      expect(keyCompletions).toContain("completions");
    });

    it("generates distinct query keys for conversion funnel", () => {
      const keyA = artistAnalyticsKeys.funnel("artistA");
      const keyB = artistAnalyticsKeys.funnel("artistB");

      expect(keyA).not.toEqual(keyB);
      expect(keyA).toContain("funnel");
      expect(keyA).toContain("artistA");
    });
  });

  describe("4. Empty States & Zero-Activity Handling", () => {
    it("handles zero streams and empty timeseries gracefully", () => {
      const emptyOverview = {
        playback: { totalPlays: 0, qualifiedPlays: 0, completions: 0, skips: 0, completionRate: 0, skipRate: 0 },
        traffic: { profileViews: 0, songViews: 0 },
        audience: { newFollowers: 0, likes: 0 },
        monetization: { revenueCents: 0, revenueFormatted: "$0.00" },
      };

      expect(formatCompactNumber(emptyOverview.playback.totalPlays)).toBe("0");
      expect(formatPercentage(emptyOverview.playback.completionRate)).toBe("0%");
      expect(formatPercentage(emptyOverview.playback.skipRate)).toBe("0%");
      expect(formatCurrency(emptyOverview.monetization.revenueCents)).toBe("$0.00");
    });

    it("detects zero-sum timeseries points for empty-chart state fallback", () => {
      const zeroTimeseries = [
        { date: "2026-10-25", plays: 0, qualifiedPlays: 0, completions: 0, songViews: 0, followers: 0, likes: 0 },
        { date: "2026-10-26", plays: 0, qualifiedPlays: 0, completions: 0, songViews: 0, followers: 0, likes: 0 },
      ];

      const totalActivity = zeroTimeseries.reduce(
        (acc, pt) =>
          acc +
          (pt.plays || 0) +
          (pt.qualifiedPlays || 0) +
          (pt.completions || 0) +
          (pt.songViews || 0) +
          (pt.followers || 0) +
          (pt.likes || 0),
        0
      );

      expect(totalActivity).toBe(0);
    });
  });
});
