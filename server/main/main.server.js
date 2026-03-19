require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./database/db");
const schedule = require("node-schedule");
const { runBackup } = require("./services/backup");
const pushSubscriptionRoutes = require("./routes/pushSubscription.route.js");
const { checkExpiringResourceRequests } = require("./services/resourceExpiryNotifier");
const { createProxyMiddleware } = require('http-proxy-middleware');
const { getMachineByMigid } = require('./controllers/proxy.controller.js');


// ✅ Connect to DB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

const {
  requireAuth,
  preventAuth,
  requireRegistrationSession,
  noCache,
} = require("../main/middleware/authMiddleware.js");

app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// HTTPS enforcement: enable when ENFORCE_HTTPS=true
if (process.env.ENFORCE_HTTPS === 'true') {
  app.set('trust proxy', 1);
  // Force HTTPS for all requests
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}

// Define path to public folder (go one level up from server/main/)
const publicPath = path.join(__dirname, "../../public");
// Serve static files from "public" folder
app.use(express.static(publicPath));

app.use(express.json()); // built-in JSON parser
app.use(express.urlencoded({ extended: true })); // for form data

// ✅ Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // change to strong key
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Replace with your actual MongoDB URI
      touchAfter: 24 * 3600, // lazy session update
      ttl: 60 * 60 * 24 * 30 // 30 days 
    }),
    cookie: { maxAge: 60 * 60 * 1000 * 24 * 30}, // 30 days
  })
);

// Homepage route → serve public/home/index.html
app.get("/", noCache, preventAuth, (req, res) => {
  res.sendFile(path.join(publicPath, "home", "home.html"));
});

// Logout route (should only be accessible to authenticated users)
app.get("/logout", requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Registration page (only accessible after email verification)
app.get("/registration", noCache, preventAuth, requireRegistrationSession, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../public/registration/registration.html")
  );
});

// Auth routes (should only be accessible to unauthenticated users)
const authRoutes = require("./routes/authRoutes");
app.use("/auth", preventAuth, authRoutes);

// DASHBOARD ROUTES (protected)
const dashboardRoutes = require("./routes/dashboard.route.js");
app.use("/dashboard", noCache, requireAuth, dashboardRoutes);

// Push Subscription API
app.use("/push-subscription", requireAuth, pushSubscriptionRoutes);

// const backupSchedule = "*/2 * * * *"; // every 2 minutes (example)
const backupSchedule = process.env.BACKUP_SCHEDULE || "0 3 * * *";

schedule.scheduleJob(backupSchedule, async () => {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString(); // e.g., "10:03:00 AM"
    
    console.log(`🕒 ${timeStr} — starting MongoDB backup...`);
    await runBackup();
  } catch (error) {
    console.error('Scheduled backup failed:', error);
  }
});

const expiryNotifySchedule = process.env.EXPIRY_NOTIFY_SCHEDULE || "5 3 * * *";
schedule.scheduleJob(expiryNotifySchedule, async () => {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    console.log(`🕒 ${timeStr} — checking for expiring resource requests...`);
    await checkExpiringResourceRequests();
  } catch (error) {
    console.error('Scheduled expiry check failed:', error);
  }
});

app.use(
  '/notebook',
  async (req, res, next) => {
    const urlMigid = req.query.migid;

    if (urlMigid) {
      try {
        const machine = await getMachineByMigid(urlMigid);
        req.session.currentMachineMigid = urlMigid;
        req.session.proxyTarget = `http://${machine.ip}:${machine.port}`;
        return req.session.save((err) => {
          if (err) return next(err);
          next();
        });
      } catch (err) {
        return res.status(404).send("Machine not found.");
      }
    }

    if (!req.session?.proxyTarget) {
      return res.status(401).send("No active session. Please launch a machine from the dashboard.");
    }

    next();
  },
  createProxyMiddleware({
    target: "http://placeholder.invalid",
    router: (req) => {
      if (!req.session?.proxyTarget) throw new Error("No proxy target in session");
      return req.session.proxyTarget;
    },
    changeOrigin: true,
    ws: true,
    pathRewrite: (path) => {
      if (path.startsWith('/notebook')) return path;
      return '/notebook' + path;
    },
    logLevel: 'debug',
    on: {
      proxyReq: (proxyReq, req) => {
        console.log("PROXY PATH →", proxyReq.path);
        console.log("ORIGINAL URL →", req.originalUrl);
      },
      error: (err, req, res) => {
        console.error("Proxy error:", err.message);
        res.status(502).send("Upstream machine unreachable.");
      }
    }
  })
);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
