require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./database/db");
// ✅ Connect to DB
connectDB();

const app = express();
const PORT = 3000;

const {
  requireAuth,
  preventAuth,
} = require("../main/middleware/authMiddleware.js");

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

const allowedHost = "localhost:3000";
app.use((req, res, next) => {
  if (req.headers.host !== allowedHost) {
    return res.status(403).json({ message: "Forbidden: Only localhost allowed" });
  }
  next();
});

// Define path to public folder (go one level up from server/main/)
const publicPath = path.join(__dirname, "../../public");
// Serve static files from "public" folder
app.use(express.static(publicPath));

app.use(express.json()); // built-in JSON parser
app.use(express.urlencoded({ extended: true })); // for form data

// ✅ Session middleware
app.use(
  session({
    secret: "super-secret-key", // change to strong key
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost:27017/college_resources', // Replace with your actual MongoDB URL
      touchAfter: 24 * 3600, // lazy session update
      ttl: 60 * 60 * 24 // 1 days session expiry
    }),
    cookie: { maxAge: 60 * 60 * 1000 * 24 * 30 }, // 30 days
  })
);

// Homepage route → serve public/home/index.html
app.get("/", preventAuth, (req, res) => {
  res.sendFile(path.join(publicPath, "home", "home.html"));
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Registration page
app.get("/registration", preventAuth, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../public/registration/registration.html")
  );
});

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// DASHBOARD ROUTES
const dashboardRoutes = require("./routes/dashboard.route.js");
app.use("/dashboard", requireAuth, dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
