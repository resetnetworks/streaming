// File: app.js
import 'express-async-errors';
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

// Routes
import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import adminplaylistRoutes from "./routes/adminPlaylist.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userDashboardRoutes from "./routes/userDashboardRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import discoverRoutes from "./routes/discoverRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";
import { stripeWebhook } from './controllers/webhookController.js';
import { razorpayWebhook } from './controllers/webhookController.js';

// Middleware
import passport from "./middleware/passport.js";
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/errorhandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many payment attempts. Try again later.",
  },
});

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Security & Parsing Middleware


app.use(
  cors({
    origin: ["http://localhost:5173", "https://www.musicreset.com", "http://127.0.0.1:5500"],
    credentials: true,
  })
);

// app.options("*", cors({
//   origin: "http://localhost:5173",
//   credentials: true,
// }));


app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
// app.use("/api/webhooks/stripe",express.raw({ type: "application/json" }), stripeWebhook); // Before JSON parsing if needed
// app.use("/api/webhooks/razorpay",express.raw({ type: "application/json" }), razorpayWebhook); // Before JSON parsing if needed
app.post(
  "/api/webhooks/razorpay",
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // 🔥 store raw body for signature verification
    },
  }),
  razorpayWebhook
);
app.use(cookieParser());
app.use(express.json());
// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ["'self'"],
//     scriptSrc: ["'self'", "https://js.stripe.com"],
//     frameSrc: ["'self'", "https://js.stripe.com"],
//   },
// }));
app.use(morgan("combined"));
app.use(xssClean());
app.use(mongoSanitize());

// Passport
app.use(passport.initialize());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/genre", genreRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/adminPlaylist", adminplaylistRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/user/dashboard", userDashboardRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// 404 and Error Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;