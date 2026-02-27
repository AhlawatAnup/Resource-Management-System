const PushSubscription = require('../database/pushSubscriptionModel');
const Admin = require('../database/adminModel');
const Teacher = require('../database/teacherModel');
const Student = require('../database/studentModel');

// Store a web-push subscription
exports.savePushSubscription = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription object is required' });
    }
    const user_id = req.session.user.id;
    const userModel = req.session.user.role.charAt(0).toUpperCase() + req.session.user.role.slice(1); // Admin/Teacher/Student

    // Upsert: update if exists, else create
    const saved = await PushSubscription.findOneAndUpdate(
      { user_id, userModel },
      { subscription },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ message: 'Push subscription saved', data: saved });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return res.status(500).json({ error: 'Failed to save push subscription' });
  }
};
