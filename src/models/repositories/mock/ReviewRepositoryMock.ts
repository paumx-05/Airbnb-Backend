/**
 * 🎯 REPOSITORY MOCK DE REVIEWS
 */

import { IReviewRepository } from '../../interfaces/IReviewRepository';
import { Review, ReviewStats } from '../../../types/reviews';

export class ReviewRepositoryMock implements IReviewRepository {
  private reviewDB = {
    reviews: [] as Review[],
    nextId: 1
  };

  async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: this.reviewDB.nextId.toString(),
      createdAt: new Date().toISOString(),
    };
    this.reviewDB.reviews.push(newReview);
    this.reviewDB.nextId++;
    return newReview;
  }

  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    return this.reviewDB.reviews
      .filter(review => review.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return this.reviewDB.reviews
      .filter(review => review.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReviewById(id: string): Promise<Review | null> {
    return this.reviewDB.reviews.find(review => review.id === id) || null;
  }

  async getAllReviews(): Promise<Review[]> {
    return this.reviewDB.reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const reviewIndex = this.reviewDB.reviews.findIndex(review => review.id === id);
    if (reviewIndex === -1) return null;
    
    this.reviewDB.reviews[reviewIndex] = {
      ...this.reviewDB.reviews[reviewIndex],
      ...updates,
    };
    return this.reviewDB.reviews[reviewIndex];
  }

  async deleteReview(id: string): Promise<boolean> {
    const reviewIndex = this.reviewDB.reviews.findIndex(review => review.id === id);
    if (reviewIndex === -1) return false;
    
    this.reviewDB.reviews.splice(reviewIndex, 1);
    return true;
  }

  async getPropertyReviewStats(propertyId: string): Promise<ReviewStats> {
    const reviews = await this.getPropertyReviews(propertyId);
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;
    
    const byRating: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      byRating[i] = reviews.filter(review => review.rating === i).length;
    }

    return {
      propertyId,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      categoryAverages: {
        cleanliness: averageRating,
        communication: averageRating,
        checkin: averageRating,
        accuracy: averageRating,
        location: averageRating,
        value: averageRating
      }
    };
  }

  async getReviewStats(): Promise<{
    total: number;
    averageRating: number;
    byRating: Record<number, number>;
  }> {
    const total = this.reviewDB.reviews.length;
    const averageRating = total > 0 ? this.reviewDB.reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
    
    const byRating: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      byRating[i] = this.reviewDB.reviews.filter(review => review.rating === i).length;
    }

    return {
      total,
      averageRating: Math.round(averageRating * 10) / 10,
      byRating
    };
  }
}
