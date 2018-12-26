import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const { Schema } = mongoose;

const pvcSchema = new Schema({
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
  lga_id: { type: Schema.Types.ObjectId },
  geo: {
    type: { type: String, enum: 'Point', default: 'Point' },
    coordinates: { type: [Number], default: [0,0] }, // [lng, lat]
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  ward: {
    type: String,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },

  verification_error: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  gender: {
    type: String,
  },
  profession: {
    type: String,
  },
  dob: {
    type: Date,
  },
  campaign: {
    type: Schema.Types.ObjectId,
    default: null,
  },
  submitted_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  polling_unit: {
    type: String,
  },
  is_submitted_by_sms: {
    type: Boolean,
    default: false
  },
  submitted_by_phone_number: {
    type: String,
    default: null
  },
  voter_info: {}
},{
  timestamps: true
});
pvcSchema.plugin(mongoosePaginate);
export default mongoose.model('PVC', pvcSchema);