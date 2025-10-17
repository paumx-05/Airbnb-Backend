import mongoose, { Document, Schema } from 'mongoose';
import { urlValidator } from './validationUtils';
import { locationSchema, getCollectionOptions } from './baseSchemas';

export interface IHostProperty extends Document {
  hostId: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  propertyType: 'entire' | 'private' | 'shared';
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  rules: string[];
  availability: {
    startDate: Date;
    endDate: Date;
    blockedDates: Date[];
  };
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const HostPropertySchema = new Schema<IHostProperty>({
  hostId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  location: locationSchema,
  propertyType: {
    type: String,
    enum: ['entire', 'private', 'shared'],
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    validate: urlValidator
  }],
  rules: [{
    type: String,
    trim: true
  }],
  availability: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    blockedDates: [{ type: Date }]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, getCollectionOptions('host_properties'));

// Indexes
HostPropertySchema.index({ hostId: 1, status: 1 });
HostPropertySchema.index({ 'location.city': 1, pricePerNight: 1 });
HostPropertySchema.index({ maxGuests: 1 });

export const HostPropertyModel = mongoose.model<IHostProperty>('HostProperty', HostPropertySchema);
