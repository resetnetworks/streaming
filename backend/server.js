import 'express-async-errors';
import express from "express";
import dotenv from "dotenv";
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
import discoverRoutes from "./routes/discoverRoutes.js";



// Database and middleware
import connectDb from "./database/db.js";
import passport from "./middleware/passport.js";
import notFoundMiddleware from "./middleware/not-found.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import adminplaylistRoutes from "./routes/adminPlaylist.js"

// Load environment variables
dotenv.config();

// Path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();
const port = process.env.PORT;


// testing 
// Swagger setup
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware

// CORS setup
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.set('trust proxy', 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
// app.use(morgan("combined"));
app.use(xssClean());
app.use(mongoSanitize());


// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });
// app.use(limiter);


// Passport
app.use(passport.initialize());

// Webhook route (placed before JSON parsing if needed)
app.use("/api/webhook", webhookRoutes);

 

// API routes
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/genre", genreRoutes)
app.use("/api/discover", discoverRoutes);
app.use("/api/adminPlaylist", adminplaylistRoutes);


// NotFoundMiddleware
app.use(notFoundMiddleware);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  connectDb();
});
