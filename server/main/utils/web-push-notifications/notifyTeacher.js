const webpush = require('web-push');
const Teacher = require('../../database/teacherModel');
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

async function notifyTeacher(teacherId, payload) {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    console.warn(`[WebPush] Teacher not found: ${teacherId}`);
    return { status: 'not-found' };
  }

  // Fetch push subscription from PushSubscription collection
  const pushSub = await PushSubscription.findOne({ user_id: teacher._id, userModel: 'Teacher' });
  if (!pushSub || !pushSub.subscription) {
    console.warn(`[WebPush] No push subscription found for teacher: ${teacher.email}`);
    return { status: 'no-subscription' };
  }
  try {
    payload.title = `TEACHER - ${payload.title}`;
    const result = await webpush.sendNotification(pushSub.subscription, JSON.stringify(payload));
    return { email: teacher.email, status: 'sent' };
  } catch (err) {
    console.error('[WebPush] Error sending notification:', err);
    return { email: teacher.email, status: 'error', error: err.message };
  }
}

module.exports = { notifyTeacher };
