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
  recipients: [recipient],
},{
  timestamps: true
});

export default mongoose.model('SMS', smsSchema);