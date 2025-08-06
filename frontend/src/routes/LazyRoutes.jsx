import { lazy } from "react";

//User pages routes
export const Register = lazy(() => import("../user/Register"));
export const Login = lazy(() => import("../user/Login"));
export const ForgotPassword = lazy(() => import("../user/ForgotPassword"));
export const ResetPassword = lazy(() => import("../user/ResetPassword"));
export const FavouriteGen = lazy(() => import("../user/FavouriteGen"));
export const Home = lazy(() => import("../user/Home"));
export const Artists = lazy(() => import("../user/Artists"));
export const Artist = lazy(() => import("../user/Artist"));
export const LikedSong = lazy(() => import("../user/LikedSong"));
export const Album = lazy(() => import("../user/Album"));
export const Search = lazy(() => import("../user/Search"));
export const Library = lazy(() => import("../user/Library"));
export const PaymentSuccess = lazy(() => import("../user/PaymentSuccess"));
export const PaymentFailure = lazy(() => import("../user/PaymentFailure"));
export const Help = lazy(() => import("../user/Help"));
export const PaymentHistory = lazy(() => import("../user/PaymentHistory"));
export const DataDeletion = lazy(() => import("../user/DataDeletion"));
export const PrivacyPolicy = lazy(() => import("../user/PrivacyPolicy"));
export const SocialLoginCallback = lazy(() => import("../user/SocialLoginCallback"));


// Admin pages routes
export const ArtistPayments = lazy(() => import("../admin/ArtistPayments"));
export const Admin = lazy(() => import("../admin/Admin"));
