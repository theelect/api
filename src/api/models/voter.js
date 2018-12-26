import mongoose from 'mongoose';

const { Schema } = mongoose;

const voterSchema = new Schema({
  vin_full: {
    type: String,
  },
  vin: {
    type: String,
    unique: true,
    required: true,
  },
  last_name: {
    type: String,
  },
  first_name: {
    type: String,
  },
  other_names: {
    type: String
  },
  state: {
   type: String 
  },
  lga: { type: String },
  ward: { type: String },
  phone: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  profession: {
    type: String,
  },
  polling_unit: {
    type: String,
  },
},{
  timestamps: true
});
export default mongoose.model('Voter', voterSchema);