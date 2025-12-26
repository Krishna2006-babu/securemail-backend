require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("Server alive");
});

connectDB();

app.use("/api/auth", authRoutes);
const authenticateToken = require("./middleware/auth");

app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Profile accessed successfully",
    userId: req.user.id
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on port ${PORT}`);
});
