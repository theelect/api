import mongoose from 'mongoose';

const { Schema } = mongoose;

const lgaSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  state_id: {
   type: String,
   required: true,
  },
  map_code: {
    type: String,
  },
  wards: {
    type: [String],
    default: [],
  },
},{
  timestamps: true
});

export default mongoose.model('LGA', lgaSchema);