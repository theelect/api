import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const { Schema } = mongoose;

const pvcSchema = new Schema({
  vin: {
    type: String,
    unique: true,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  state_id: {
    type: String,
    required: true,
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
  campaign: {
    type: Schema.Types.ObjectId,
    default: null,
  },
  submitted_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  voter_info: {}
},{
  timestamps: true
});
pvcSchema.plugin(mongoosePaginate);
export default mongoose.model('PVC', pvcSchema);