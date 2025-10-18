import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  propertyId: string;
  userId: string;
  reservationId: string;
  rating: number;
  comment: string;
  categories: {
    cleanliness: number;
    communication: number;
    checkin: number;
    accuracy: number;
    location: number;
    value: number;
  };
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  propertyId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  reservationId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  categories: {
    cleanliness: { type: Number, required: true, min: 1, max: 5 },
    communication: { type: Number, required: true, min: 1, max: 5 },
    checkin: { type: Number, required: true, min: 1, max: 5 },
    accuracy: { type: Number, required: true, min: 1, max: 5 },
    location: { type: Number, required: true, min: 1, max: 5 },
    value: { type: Number, required: true, min: 1, max: 5 }
  },
  isVerified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'reviews'
});

// Indexes
ReviewSchema.index({ propertyId: 1, rating: -1 });
ReviewSchema.index({ userId: 1 });

// Compound index to prevent duplicate reviews
ReviewSchema.index({ propertyId: 1, userId: 1, reservationId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);
