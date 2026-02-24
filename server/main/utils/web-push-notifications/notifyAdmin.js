const webpush = require('web-push');
const Admin = require('../../database/adminModel');
const PushSubscription = require('../../database/pushSubscriptionModel');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  'mailto:admin@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function  notifyAdmin(payload) {
  const admin = await Admin.findOne({});
  if (!admin) {
    return { status: "no-admin-found" };
  }
  // Fetch push subscription from PushSubscription collection
  const pushSub = await PushSubscription.findOne({ user_id: admin._id, userModel: 'Admin' });
  if (!pushSub || !pushSub.subscription) {
    return { email: admin.email, status: 'no-subscription' };
  }
  try {
    payload.title = `ADMIN - ${payload.title}`;
    await webpush.sendNotification(
      pushSub.subscription,
      JSON.stringify(payload)
    );
    return { email: admin.email, status: 'sent' };
  } catch (err) {
    return { email: admin.email, status: 'error', error: err.message };
  }
}


module.exports = { notifyAdmin };
