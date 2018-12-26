import mongoose from 'mongoose';

const { Schema } = mongoose;

const recipient = new Schema({
  statusCode: { 
    type: Number,
  },
  status: { 
    type: String,
  },
  number: { 
    type: String,
  },
  cost: { 
    type: String,
  },
  messageId: { 
    type: String,
  },
});

const smsSchema = new Schema({
  status: {
    type: String,
  },
  to: {
    type: Array,
  },
  is_scheduled: {
    type: Boolean,
    default: false,
  },
  scheduledDate: {
    type: Date,
    default: null,
  },
  message: {
   type: String,
   required: true,
  },
  senders_name: {
    type: String,
    default: 'TonyeCole',
  },
  number_of_recipient: {
    type: Number,
    required: true
  },
  recipients: {
    type: [recipient],
    default: [],
  }
},{
  timestamps: true
});

export default mongoose.model('SMS', smsSchema);