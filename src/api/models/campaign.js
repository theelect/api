import mongoose from 'mongoose';

const { Schema } = mongoose;

const campaignSchema = new Schema({
  apiKey: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, {
  timestamp: true,
});

export default mongoose.model('Campaign', campaignSchema); 