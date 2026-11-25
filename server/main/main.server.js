const { app, express, publicPath } = require('../headers.server.js');
const path = require('path');
const bodyParser = require('body-parser');
const connectDB = require('./database/db');
const { connectStatsDB, getStatsConnection } = require('./database/connectStatsDB');
const schedule = require('node-schedule');
const { runBackup } = require('./services/backup');
const pushSubscriptionRoutes = require('./routes/pushSubscription.route.js');
const proxyMachineRoute = require('./proxy/routes/proxyMachine.route.js');
const { sendAllotmentNotifications } = require('./services/resourceExpiryNotifier');

const {
  markExpiredAllotmentsHistoryAndCleanupDocker,
} = require('./services/expiryAllotmentsAndDocker.js'); // adjust path
const { collectAndStoreStats } = require('./services/collectAllMachineStats.js');

require('../RTC/socket.server.js');

// ✅ Connect to DBs
connectDB();
connectStatsDB();

const {
  requireAuth,
  preventAuth,
  requireRegistrationSession,
  noCache,
} = require('../main/middleware/authMiddleware.js');

// SPECIFY THE PARSER SO THAT /NOTEBOOK BODY GET UNPARSED
app.get('/', express.json());
app.use('/logout', express.json());
app.use('/registration', express.json());
app.use('/auth', express.json());
app.use('/dashboard', express.json());
app.use('/push-subscription', express.json());
app.use('/notebook/proxy/set-session', express.json());
app.use('/notebook/proxy/token', express.json());
// app.use(express.json()); // built-in JSON parser
// ===========================================

// Homepage route → serve public/home/index.html
app.get('/', noCache, preventAuth, (req, res) => {
  res.sendFile(path.join(publicPath, 'home.pack', 'home.html'));
});

// Logout route (should only be accessible to authenticated users)
app.get('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Registration page (only accessible after email verification)
app.get('/registration', noCache, preventAuth, requireRegistrationSession, (req, res) => {
  if (req.session.role !== req.query.role) return;

  if (req.query.role == 'teacher')
    res.sendFile(path.join(publicPath, 'teacher_registration.pack', 'teacher.registration.html'));

  if (req.query.role == 'student')
    res.sendFile(path.join(publicPath, 'student_registration.pack', 'student.registration.html'));

  // res.sendFile(path.join(publicPath, 'teacher_registration.pack', 'teacher.registration.html'));
});

// Auth routes (should only be accessible to unauthenticated users)
const authRoutes = require('./routes/authRoutes');
app.use('/auth', preventAuth, authRoutes);

// DASHBOARD ROUTES (protected)
const dashboardRoutes = require('./routes/dashboard.route.js');
app.use('/dashboard', noCache, requireAuth, dashboardRoutes);

// Push Subscription API
app.use('/push-subscription', requireAuth, pushSubscriptionRoutes);

app.get('/whats-inside-the-machine', (req, res) => {
  res.sendFile(
    path.join(publicPath, 'whatsInsideMachine', 'ai_datacenter_docker_docs_versioned.html'),
  );
});

//================================= schedule jobs ========================================

// Schedule job for backup
const backupSchedule = process.env.BACKUP_SCHEDULE || '0 3 * * *';
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

// Schedule job to go through each allotment and send email if today is the starting or expiry day
const expiryNotifySchedule = process.env.EXPIRY_NOTIFY_SCHEDULE || '0 9 * * *';
schedule.scheduleJob(expiryNotifySchedule, async () => {
  try {
    console.log('🕘 Running expiry check job...');
    await sendAllotmentNotifications();
  } catch (error) {
    console.error('Scheduled expiry check failed:', error);
  }
});

// Run expired allotments cleanup once on server start
markExpiredAllotmentsHistoryAndCleanupDocker()
  .then(() => console.log('Initial expired allotments cleanup done.'))
  .catch((err) => console.error('Initial expired allotments cleanup failed:', err));

// Schedule job to go through all machine allotmetns: save history and restart machine using docker
const expiryAllotmentsSchedule = process.env.EXPIRY_ALLOTMENTS_SCHEDULE;
schedule.scheduleJob(expiryAllotmentsSchedule, async () => {
  console.log(`Expired allotments scheduler started...`);
  await markExpiredAllotmentsHistoryAndCleanupDocker();
});

// Schedule job for storing machine stats in seperate DB
const machineStatsSchedule = process.env.MACHINE_STATS_SCHEDULE || '0 0 * * *';
schedule.scheduleJob(machineStatsSchedule, async () => {
  console.log(`[${new Date().toLocaleTimeString()}] Starting stats collection...`);
  try {
    await collectAndStoreStats(getStatsConnection());
  } catch (err) {
    console.error('Scheduler Error:', err);
  }
});

app.use('/notebook', proxyMachineRoute);
