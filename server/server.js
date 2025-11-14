require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const userRoutes = require("./routers/userRoutes/userRoute");
const bloodRequestRoutes = require("./routers/bloodRoutes/bloodRequestRoute");
const hospitalRoutes = require("./routers/hospitalRoutes/hospitalDashboardRoute");
const bloodBankRoutes = require("./routers/bloodBankRoutes/bloodBankRoute");
const inventoryRoutes = require("./routers/inventoryRoutes/inventoryRoute");
const campRoutes = require("./routers/campRoutes/campRoute");
const campRegistrationRoutes = require("./routers/campRoutes/campRegistrationRoute");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
  allowEIO3: true, // backward compatibility with older socket.io-client versions
  transports: ["websocket", "polling"], // accept both transport types
});


app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

app.use("/api/user", userRoutes);
app.use("/api/blood-request", bloodRequestRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/blood-bank", bloodBankRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/camps", campRoutes);
app.use("/api/camp-registrations", campRegistrationRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Robust port selection with fallback to next ports if busy
const basePort = Number(process.env.PORT) || 8080;
let attempts = 0;
const maxAttempts = 5; // try 8080..8085

const tryListen = (port) => {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
};

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE" && attempts < maxAttempts) {
    const nextPort = basePort + (++attempts);
    console.warn(`Port ${nextPort - 1} in use; trying ${nextPort}...`);
    tryListen(nextPort);
    return;
  }
  console.error("Server error:", err);
  process.exit(1);
});

tryListen(basePort);
