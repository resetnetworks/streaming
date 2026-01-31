import { lazy } from "react";

const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      window.location.reload();
      throw error;
    }
  });

//User pages routes
export const Register = lazyWithRetry(() => import("../pages/user/Register"));
export const Login = lazyWithRetry(() => import("../pages/user/Login"));
export const ForgotPassword = lazyWithRetry(() => import("../pages/user/ForgotPassword"));
export const ResetPassword = lazyWithRetry(() => import("../pages/user/ResetPassword"));
export const FavouriteGen = lazyWithRetry(() => import("../pages/user/FavouriteGen"));
export const Home = lazyWithRetry(() => import("../pages/user/Home"));
export const AlbumsPage = lazyWithRetry(() => import("../pages/user/AlbumsPage"));
export const Artists = lazyWithRetry(() => import("../pages/user/Artists"));
export const Artist = lazyWithRetry(() => import("../pages/user/Artist"));
export const LikedSong = lazyWithRetry(() => import("../pages/user/LikedSong"));
export const Album = lazyWithRetry(() => import("../pages/user/Album"));
export const Search = lazyWithRetry(() => import("../pages/user/Search"));
export const Purchases = lazyWithRetry(() => import("../pages/user/Purchases"));
export const PaymentSuccess = lazyWithRetry(() => import("../pages/user/PaymentSuccess"));
export const PaymentFailure = lazyWithRetry(() => import("../pages/user/PaymentFailure"));
export const Help = lazyWithRetry(() => import("../pages/user/Help"));
export const PaymentHistory = lazyWithRetry(() => import("../pages/user/PaymentHistory"));
export const DataDeletion = lazyWithRetry(() => import("../pages/user/DataDeletion"));
export const PrivacyPolicy = lazyWithRetry(() => import("../pages/user/PrivacyPolicy"));
export const SocialLoginCallback = lazyWithRetry(() => import("../pages/user/SocialLoginCallback"));
export const Genre = lazyWithRetry(() => import("../pages/user/Genre"));
export const LandingPage = lazyWithRetry(() => import("../pages/user/LandingPage"));
export const TermsAndConditions = lazyWithRetry(() => import("../pages/user/TermsAndConditions"));
export const About = lazyWithRetry(() => import("../pages/user/About"));
export const CancellationRefundPolicy = lazyWithRetry(() => import("../pages/user/CancellationRefundPolicy"));
export const Career = lazyWithRetry(() => import("../pages/user/Career"));
export const ArtistDetails = lazyWithRetry(() => import("../pages/user/ArtistDetails"));
export const Song = lazyWithRetry(() => import("../pages/user/Song"));


// Artist pages routes
export const ArtistRegister = lazyWithRetry(() => import("../pages/artist/ArtistRegister"));
export const ArtistDashboard = lazyWithRetry(() => import("../pages/artist/Dashboard"));



// Admin pages routes
export const ArtistPayments = lazyWithRetry(() => import("../pages/admin/ArtistPayments"));
export const Admin = lazyWithRetry(() => import("../pages/admin/Admin"));
