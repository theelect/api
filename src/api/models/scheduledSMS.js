import mongoose from 'mongoose';

const { Schema } = mongoose;

const scheduledSMSSchema = new Schema({
  to: {
    type: Array,
    required: true,
  },
  message: {
   type: String,
   required: true,
  },
  from: {
    type: String,
    default: 'TonyeCole',
  },
  date: {
    type: Date,
    required: true,
  },
},{
  timestamps: true
});

export default mongoose.model('ScheduledSMS', scheduledSMSSchema);