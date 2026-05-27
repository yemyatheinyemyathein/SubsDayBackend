import mongoose, { Schema } from 'mongoose';
import { ISubscription, ISharedMember } from '../types';

export type ISubscriptionDocument = ISubscription & mongoose.Document;

const sharedMemberSchema = new Schema<ISharedMember>(
  {
    user: { type: mongoose.Schema.Types.ObjectId as any, ref: 'User' },
    email: { type: String, required: true, trim: true, lowercase: true },
    status: { type: String, enum: ['pending', 'active'], default: 'pending' },
    shareAmount: { type: Number, required: true, min: 0 },
    joinedAt: { type: Date },
  },
  { _id: false }
);

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId as any, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'weekly', 'custom'],
      default: 'monthly',
    },
    nextBillingDate: { type: Date, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    category: { type: String, default: 'Other' },
    status: {
      type: String,
      enum: ['active', 'canceled'],
      default: 'active',
    },
    logo: { type: String },
    notes: { type: String },
    isShared: { type: Boolean, default: false },
    sharedMembers: [sharedMemberSchema],
    splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ user: 1, nextBillingDate: 1 });
subscriptionSchema.index({ 'sharedMembers.email': 1, 'sharedMembers.status': 1 });

export default mongoose.model<ISubscriptionDocument>(
  'Subscription',
  subscriptionSchema
);
