import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  files: string[];
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  principalComment?: string;
  submissionDate: Date;
  actionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: [
      'Sick Leave',
      'Vacation Request',
      'Personal Leave',
      'Medical Leave',
      'Emergency Leave',
      'Study Leave',
      'Maternity/Paternity Leave',
      'Bereavement Leave',
      'Other'
    ]
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  files: [{
    type: String,
    default: []
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'returned'],
    default: 'pending'
  },
  principalComment: {
    type: String,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  actionDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IApplication>('Application', ApplicationSchema);
