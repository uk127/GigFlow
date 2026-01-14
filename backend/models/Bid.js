import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Bid message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Bid price is required'],
    min: [1, 'Price must be greater than 0']
  },
  status: {
    type: String,
    enum: ['pending', 'hired', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });

export default mongoose.model('Bid', bidSchema);
