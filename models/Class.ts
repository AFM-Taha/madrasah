import mongoose from 'mongoose'

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Class name cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Create index for efficient queries
ClassSchema.index({ name: 1 })
ClassSchema.index({ isActive: 1 })

export default mongoose.models.Class || mongoose.model('Class', ClassSchema)