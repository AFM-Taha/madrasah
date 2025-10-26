import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  phone?: string;
  password: string;
  role: 'principal' | 'teacher' | 'student';
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Teacher specific fields
  subjects?: string[];
  classes?: mongoose.Types.ObjectId[];
  
  // Student specific fields
  studentId?: string;
  grade?: string;
  section?: string;
  parentContact?: {
    fatherName?: string;
    motherName?: string;
    fatherPhone?: string;
    motherPhone?: string;
    address?: string;
  };
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['principal', 'teacher', 'student'],
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Teacher specific fields
  subjects: [{
    type: String,
    trim: true,
  }],
  classes: [{
    type: Schema.Types.ObjectId,
    ref: 'Class',
  }],
  
  // Student specific fields
  studentId: {
    type: String,
    sparse: true,
    unique: true,
    trim: true,
  },
  grade: {
    type: String,
    trim: true,
  },
  section: {
    type: String,
    trim: true,
  },
  parentContact: {
    fatherName: { type: String, trim: true },
    motherName: { type: String, trim: true },
    fatherPhone: { type: String, trim: true },
    motherPhone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
}, {
  timestamps: true,
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ studentId: 1 });
UserSchema.index({ isActive: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);