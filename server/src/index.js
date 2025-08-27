import express from "express";
import cors from "cors";
import passport from "passport";
import { Server } from "socket.io";
import http from "http";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import chatSocket from "./sockets/chatSocket.js";
import itemRoutes from "./routes/itemRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import configRouters from "./routes/configRoutes.js";
import tagsRoutes from "./routes/tagsRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

import "./config/passport/google.js";
import "./config/passport/github.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/inventories", inventoryRoutes);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/config", configRouters);
app.use("/api/v1/tags", tagsRoutes);
app.use("/api/v1/search", searchRoutes);

io.on("connection", (socket) => {
  chatSocket(io, socket);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
