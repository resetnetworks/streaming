import express from "express";
import dotenv from "dotenv";
import connectDb from "./database/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import artistRouts from "./routes/artistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js"
import passport from "./middleware/passport.js";
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT 

// Load swagger.yaml
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml')); 
// Setup Swagger UI
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Serve swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cookieParser());


// using middlewares
app.use("/api/webhook", webhookRoutes)
app.use(express.json());




app.use(passport.initialize());


// using routes  
app.use("/api/users", userRoutes)
app.use("/api/songs", songRoutes)
app.use("/api/playlist", playlistRoutes)
app.use("/api/albums", albumRoutes)
app.use("/api/artists", artistRouts)
app.use("/api/payment", paymentRoutes)




app.listen(port, () => {
  console.log(`http://localhost:${port}`)
  connectDb()
})
