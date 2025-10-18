/**
 * Common validation utilities for Mongoose schemas
 */

// URL validation
export const urlValidator = {
  validator: function(v: string) {
    return !v || /^https?:\/\/.+/.test(v);
  },
  message: 'Must be a valid URL'
};

// Email validation
export const emailValidator = {
  validator: function(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  },
  message: 'Must be a valid email address'
};

// Card number validation
export const cardNumberValidator = {
  validator: function(v: string) {
    return !v || /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(v);
  },
  message: 'Invalid card number format'
};

// Date range validation
export const validateDateRange = function(this: any, next: any) {
  if (this.checkOut && this.checkIn && this.checkOut <= this.checkIn) {
    next(new Error('Check-out date must be after check-in date'));
  } else {
    next();
  }
};

// Common field definitions
export const commonFields = {
  userId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
};
