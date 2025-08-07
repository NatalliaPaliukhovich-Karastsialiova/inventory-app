import express from "express";
import cors from "cors";
import passport from 'passport';

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import './config/passport/google.js';
import './config/passport/github.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);

export default app;
