const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const connectDB = require("./database/db");
// ✅ Connect to DB
connectDB();

const app = express();
const PORT = 3000;

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
    cookie: { maxAge: 60 * 60 * 1000 * 24 * 30 }, // 30 days
  })
);

// Homepage route → serve public/home/index.html
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.sendFile(path.join(publicPath, "home", "home.html"));
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.sendFile(path.join(publicPath, "dashboard", "common.dashboard.html"));
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Registration page
app.get("/registration", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../public/registration/registration.html")
  );
});

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// DASHBOARD ROUTES
const dashboardRoutes = require("./routes/dashboard.route.js");
app.use("/dashboard", dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
