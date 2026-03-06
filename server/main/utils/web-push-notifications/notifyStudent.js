const webpush = require('web-push');
const Student = require('../../database/studentModel');
const PushSubscription = require('../../database/pushSubscriptionModel');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};


webpush.setVapidDetails(
  `mailto:${process.env.EMAIL_USER}`,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function notifyStudent(studentId, payload) {
  const student = await Student.findById(studentId);
  if (!student) {
    console.warn(`[WebPush] Student not found: ${studentId}`);
    return { status: 'not-found' };
  }

  // Fetch push subscription from PushSubscription collection
  const pushSub = await PushSubscription.findOne({ user_id: student._id, userModel: 'Student' });
  if (!pushSub || !pushSub.subscription) {
    console.warn(`[WebPush] No push subscription found for student: ${student.email}`);
    return { status: 'no-subscription' };
  }
  try {
    payload.title = `STUDENT - ${payload.title}`;
    const result = await webpush.sendNotification(pushSub.subscription, JSON.stringify(payload));
    return { email: student.email, status: 'sent' };
  } catch (err) {
    console.error('[WebPush] Error sending notification:', err);
    return { email: student.email, status: 'error', error: err.message };
  }
}

module.exports = { notifyStudent };
