import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [1, 'Budget must be greater than 0']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'assigned'],
    default: 'open'
  }
}, {
  timestamps: true
});

gigSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Gig', gigSchema);
