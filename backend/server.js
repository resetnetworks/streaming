import express from "express";
import dotenv from "dotenv";
import connectDb from "./database/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import passport from "./middleware/passport.js";

dotenv.config();

const app = express();
const port = process.env.PORT 


app.use(cookieParser());
// using middlewares
app.use(express.json());


app.use(passport.initialize());


// using routes  
app.use("/api/users", userRoutes)
app.use("/api/songs", songRoutes)



app.listen(port, () => {
  console.log(`http://loalhost:${port}`)
  connectDb()
})
