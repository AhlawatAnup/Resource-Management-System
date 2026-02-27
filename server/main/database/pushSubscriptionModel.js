const mongoose = require('mongoose');
const { Schema } = mongoose;

const pushSubscriptionSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Teacher', 'Student']
  },
  subscription: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
