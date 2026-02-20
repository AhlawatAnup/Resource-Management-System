const webpush = require('web-push');
const Teacher = require('../../database/teacherModel');
const PushSubscription = require('../../database/pushSubscriptionModel');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

console.log('[WebPush] Using VAPID public key:', vapidKeys.publicKey);
console.log('[WebPush] Using VAPID private key:', vapidKeys.privateKey ? '***HIDDEN***' : 'NOT SET');

webpush.setVapidDetails(
  `mailto:${process.env.EMAIL_USER}`,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function notifyTeacher(teacherId, payload) {
  console.log(`[WebPush] Notifying teacher: ${teacherId}`);
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    console.warn(`[WebPush] Teacher not found: ${teacherId}`);
    return { status: 'not-found' };
  }
  console.log(`[WebPush] Teacher email: ${teacher.email}`);

  // Fetch push subscription from PushSubscription collection
  const pushSub = await PushSubscription.findOne({ user_id: teacher._id, userModel: 'Teacher' });
  if (!pushSub || !pushSub.subscription) {
    console.warn(`[WebPush] No push subscription found for teacher: ${teacher.email}`);
    return { status: 'no-subscription' };
  }
  console.log('[WebPush] Push subscription:', JSON.stringify(pushSub.subscription));
  try {
    const result = await webpush.sendNotification(pushSub.subscription, JSON.stringify(payload));
    console.log('[WebPush] Notification sent. Result:', result);
    return { email: teacher.email, status: 'sent' };
  } catch (err) {
    console.error('[WebPush] Error sending notification:', err);
    return { email: teacher.email, status: 'error', error: err.message };
  }
}

module.exports = { notifyTeacher };
