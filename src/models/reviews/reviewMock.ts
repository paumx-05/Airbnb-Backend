import { Review, ReviewStats } from '../../types/reviews';

// Base de datos mock de reviews
const reviewDB = {
  reviews: [] as Review[],
  nextId: 1
};

export const createReview = (review: Omit<Review, 'id' | 'createdAt'>): Review => {
  const newReview: Review = {
    ...review,
    id: reviewDB.nextId.toString(),
    createdAt: new Date().toISOString()
  };
  reviewDB.reviews.push(newReview);
  reviewDB.nextId++;
  return newReview;
};

export const getPropertyReviews = (propertyId: string, limit: number = 10): Review[] => {
  return reviewDB.reviews
    .filter(r => r.propertyId === propertyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getUserReviews = (userId: string): Review[] => {
  return reviewDB.reviews
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getReviewById = (id: string): Review | null => {
  return reviewDB.reviews.find(r => r.id === id) || null;
};

export const getPropertyReviewStats = (propertyId: string): ReviewStats => {
  const reviews = reviewDB.reviews.filter(r => r.propertyId === propertyId);
  
  if (reviews.length === 0) {
    return {
      propertyId,
      averageRating: 0,
      totalReviews: 0,
      categoryAverages: {
        cleanliness: 0,
        communication: 0,
        checkin: 0,
        accuracy: 0,
        location: 0,
        value: 0
      }
    };
  }
  
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  const categoryAverages = {
    cleanliness: reviews.reduce((sum, r) => sum + r.categories.cleanliness, 0) / reviews.length,
    communication: reviews.reduce((sum, r) => sum + r.categories.communication, 0) / reviews.length,
    checkin: reviews.reduce((sum, r) => sum + r.categories.checkin, 0) / reviews.length,
    accuracy: reviews.reduce((sum, r) => sum + r.categories.accuracy, 0) / reviews.length,
    location: reviews.reduce((sum, r) => sum + r.categories.location, 0) / reviews.length,
    value: reviews.reduce((sum, r) => sum + r.categories.value, 0) / reviews.length
  };
  
  return {
    propertyId,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    categoryAverages: {
      cleanliness: Math.round(categoryAverages.cleanliness * 10) / 10,
      communication: Math.round(categoryAverages.communication * 10) / 10,
      checkin: Math.round(categoryAverages.checkin * 10) / 10,
      accuracy: Math.round(categoryAverages.accuracy * 10) / 10,
      location: Math.round(categoryAverages.location * 10) / 10,
      value: Math.round(categoryAverages.value * 10) / 10
    }
  };
};

export const getAllReviews = (): Review[] => {
  return reviewDB.reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getReviewStats = (): {
  total: number;
  averageRating: number;
  ratingDistribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
} => {
  const total = reviewDB.reviews.length;
  const averageRating = total > 0 ? reviewDB.reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  
  const ratingDistribution = {
    '5': reviewDB.reviews.filter(r => r.rating === 5).length,
    '4': reviewDB.reviews.filter(r => r.rating === 4).length,
    '3': reviewDB.reviews.filter(r => r.rating === 3).length,
    '2': reviewDB.reviews.filter(r => r.rating === 2).length,
    '1': reviewDB.reviews.filter(r => r.rating === 1).length
  };

  return {
    total,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution
  };
};

export const updateReview = (id: string, updates: Partial<Review>): boolean => {
  const review = reviewDB.reviews.find(r => r.id === id);
  if (review) {
    Object.assign(review, updates);
    return true;
  }
  return false;
};

export const deleteReview = (id: string): boolean => {
  const index = reviewDB.reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    reviewDB.reviews.splice(index, 1);
    return true;
  }
  return false;
};
