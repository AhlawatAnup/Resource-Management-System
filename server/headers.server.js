require('dotenv').config();
const cors = require('cors');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketIO = require('socket.io');
const path = require('path');

const session = require('express-session');
const MongoStore = require('connect-mongo');

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

// Define path to public folder (go one level up from server/main/)
const publicPath = path.join(__dirname, '../public');

// Serve static files from "public" folder
app.use(express.static(publicPath));

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600,
    ttl: 60 * 60 * 24 * 30,
  }),
  cookie: { maxAge: 60 * 60 * 1000 * 24 * 30 },
});

// ✅ Session middleware
app.use(sessionMiddleware);

// HTTPS enforcement: enable when ENFORCE_HTTPS=true
if (process.env.ENFORCE_HTTPS === 'true') {
  app.set('trust proxy', 1);
  // Force HTTPS for all requests
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const io = new socketIO.Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

module.exports = { app, express, io, publicPath };
