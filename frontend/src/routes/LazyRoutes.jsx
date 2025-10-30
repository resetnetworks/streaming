import { lazy } from "react";

//User pages routes
export const Register = lazy(() => import("../pages/user/Register"));
export const Login = lazy(() => import("../pages/user/Login"));
export const ForgotPassword = lazy(() => import("../pages/user/ForgotPassword"));
export const ResetPassword = lazy(() => import("../pages/user/ResetPassword"));
export const FavouriteGen = lazy(() => import("../pages/user/FavouriteGen"));
export const Home = lazy(() => import("../pages/user/Home"));
export const Artists = lazy(() => import("../pages/user/Artists"));
export const Artist = lazy(() => import("../pages/user/Artist"));
export const LikedSong = lazy(() => import("../pages/user/LikedSong"));
export const Album = lazy(() => import("../pages/user/Album"));
export const Search = lazy(() => import("../pages/user/Search"));
export const Purchases = lazy(() => import("../pages/user/Purchases"));
export const PaymentSuccess = lazy(() => import("../pages/user/PaymentSuccess"));
export const PaymentFailure = lazy(() => import("../pages/user/PaymentFailure"));
export const Help = lazy(() => import("../pages/user/Help"));
export const PaymentHistory = lazy(() => import("../pages/user/PaymentHistory"));
export const DataDeletion = lazy(() => import("../pages/user/DataDeletion"));
export const PrivacyPolicy = lazy(() => import("../pages/user/PrivacyPolicy"));
export const SocialLoginCallback = lazy(() => import("../pages/user/SocialLoginCallback"));
export const Genre = lazy(() => import("../pages/user/Genre"));
export const LandingPage = lazy(() => import("../pages/user/LandingPage"));
export const TermsAndConditions = lazy(() => import("../pages/user/TermsAndConditions"));
export const About = lazy(() => import("../pages/user/About"));
export const CancellationRefundPolicy = lazy(() => import("../pages/user/CancellationRefundPolicy"));
export const Career = lazy(() => import("../pages/user/Career"));


// Artist pages routes
export const ArtistRegister = lazy(() => import("../pages/artist/ArtistRegister"));



// Admin pages routes
export const ArtistPayments = lazy(() => import("../pages/admin/ArtistPayments"));
export const Admin = lazy(() => import("../pages/admin/Admin"));
