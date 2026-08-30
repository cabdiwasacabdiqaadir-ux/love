require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const heartRoutes = require("./routes/heartRoutes");
const moodRoutes = require("./routes/moodRoutes");
const journalRoutes = require("./routes/journalRoutes");
const challengeRoutes = require("./routes/challengeRoutes");

const app = express();

/* ---------------------------- Core middleware ---------------------------- */
// We use Bearer-token auth (no cookies), so credentials:true is unnecessary
// and would conflict with a wildcard origin. CLIENT_ORIGIN="*" is fine for
// local development, including testing from a Claude artifact preview.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "*").split(",").map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------- Health --------------------------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "HeartReset API" });
});

/* -------------------------------- Routes ---------------------------------- */
// Make sure MongoDB is connected (or already connecting) before any of these
// routes run — cheap no-op once warm, see config/db.js for the connection
// cache. Scoped here (not globally) so /api/health and unknown routes never
// depend on the database being reachable.
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
};

app.use("/api/auth", ensureDB, authRoutes);
app.use("/api/heart", ensureDB, heartRoutes);
app.use("/api/mood", ensureDB, moodRoutes);
app.use("/api/journal", ensureDB, journalRoutes);
app.use("/api/challenges", ensureDB, challengeRoutes);

/* ---------------------------- Error handling ------------------------------ */
app.use(notFound);
app.use(errorHandler);

/* ---------------------------------- Boot ----------------------------------- */
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`HeartReset API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
