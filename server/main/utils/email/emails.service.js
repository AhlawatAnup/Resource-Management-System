module.exports = {
  ...require('./common/otp.email'),

  ...require('./student/registration.email'),
  ...require('./student/profile.email'),
  ...require('./student/resource.email'),

  ...require('./teacher/registration.email'),
  ...require('./teacher/profile.email'),
  ...require('./teacher/notification.email'),

  ...require('./admin/notification.email'),
};
