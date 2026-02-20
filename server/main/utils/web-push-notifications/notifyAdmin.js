const webpush = require('web-push');
const Admin = require('../../database/adminModel');

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

  if (!admin.pushSubscription) {
    return { email: admin.email, status: "no-subscription" };
  }

  try {
    await webpush.sendNotification(
      admin.pushSubscription,
      JSON.stringify(payload)
    );

    return { email: admin.email, status: "sent" };

  } catch (err) {
    return { email: admin.email, status: "error", error: err.message };
  }
}


module.exports = { notifyAdmin };
