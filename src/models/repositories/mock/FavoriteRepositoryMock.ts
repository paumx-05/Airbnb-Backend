/**
 * 🎯 REPOSITORY MOCK DE FAVORITOS
 */

import { IFavoriteRepository } from '../../interfaces/IFavoriteRepository';
import { Favorite, Wishlist } from '../../../types/favorites';

export class FavoriteRepositoryMock implements IFavoriteRepository {
  private favoriteDB = {
    favorites: [] as Favorite[],
    wishlists: [] as Wishlist[],
    nextId: 1
  };

  async addFavorite(userId: string, propertyId: string): Promise<Favorite> {
    const newFavorite: Favorite = {
      id: this.favoriteDB.nextId.toString(),
      userId,
      propertyId,
      createdAt: new Date().toISOString()
    };
    this.favoriteDB.favorites.push(newFavorite);
    this.favoriteDB.nextId++;
    return newFavorite;
  }

  async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    const favoriteIndex = this.favoriteDB.favorites.findIndex(favorite => 
      favorite.userId === userId && favorite.propertyId === propertyId
    );
    if (favoriteIndex === -1) return false;
    
    this.favoriteDB.favorites.splice(favoriteIndex, 1);
    return true;
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteDB.favorites
      .filter(favorite => favorite.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    return this.favoriteDB.favorites.some(favorite => 
      favorite.userId === userId && favorite.propertyId === propertyId
    );
  }

  async createWishlist(userId: string, wishlistData: Omit<Wishlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wishlist> {
    const newWishlist: Wishlist = {
      ...wishlistData,
      id: this.favoriteDB.nextId.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.favoriteDB.wishlists.push(newWishlist);
    this.favoriteDB.nextId++;
    return newWishlist;
  }

  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    return this.favoriteDB.wishlists
      .filter(wishlist => wishlist.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPublicWishlists(): Promise<Wishlist[]> {
    return this.favoriteDB.wishlists
      .filter(wishlist => wishlist.isPublic)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getWishlistById(id: string): Promise<Wishlist | null> {
    return this.favoriteDB.wishlists.find(wishlist => wishlist.id === id) || null;
  }

  async updateWishlist(id: string, updates: Partial<Wishlist>): Promise<Wishlist | null> {
    const wishlistIndex = this.favoriteDB.wishlists.findIndex(wishlist => wishlist.id === id);
    if (wishlistIndex === -1) return null;
    
    this.favoriteDB.wishlists[wishlistIndex] = {
      ...this.favoriteDB.wishlists[wishlistIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.favoriteDB.wishlists[wishlistIndex];
  }

  async deleteWishlist(id: string): Promise<boolean> {
    const wishlistIndex = this.favoriteDB.wishlists.findIndex(wishlist => wishlist.id === id);
    if (wishlistIndex === -1) return false;
    
    this.favoriteDB.wishlists.splice(wishlistIndex, 1);
    return true;
  }

  async addToWishlist(wishlistId: string, propertyId: string): Promise<boolean> {
    const wishlist = await this.getWishlistById(wishlistId);
    if (!wishlist) return false;
    
    if (!wishlist.propertyIds.includes(propertyId)) {
      wishlist.propertyIds.push(propertyId);
      await this.updateWishlist(wishlistId, { propertyIds: wishlist.propertyIds });
    }
    return true;
  }

  async removeFromWishlist(wishlistId: string, propertyId: string): Promise<boolean> {
    const wishlist = await this.getWishlistById(wishlistId);
    if (!wishlist) return false;
    
    wishlist.propertyIds = wishlist.propertyIds.filter(id => id !== propertyId);
    await this.updateWishlist(wishlistId, { propertyIds: wishlist.propertyIds });
    return true;
  }

  async getFavoriteStats(): Promise<{
    totalFavorites: number;
    totalWishlists: number;
    averageFavoritesPerUser: number;
    mostFavoritedProperties: Array<{ propertyId: string; count: number }>;
  }> {
    const totalFavorites = this.favoriteDB.favorites.length;
    const totalWishlists = this.favoriteDB.wishlists.length;
    
    const userFavorites = new Map<string, number>();
    this.favoriteDB.favorites.forEach(favorite => {
      userFavorites.set(favorite.userId, (userFavorites.get(favorite.userId) || 0) + 1);
    });
    
    const averageFavoritesPerUser = userFavorites.size > 0 
      ? totalFavorites / userFavorites.size 
      : 0;

    const propertyFavorites = new Map<string, number>();
    this.favoriteDB.favorites.forEach(favorite => {
      propertyFavorites.set(favorite.propertyId, (propertyFavorites.get(favorite.propertyId) || 0) + 1);
    });

    const mostFavoritedProperties = Array.from(propertyFavorites.entries())
      .map(([propertyId, count]) => ({ propertyId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalFavorites,
      totalWishlists,
      averageFavoritesPerUser: Math.round(averageFavoritesPerUser * 100) / 100,
      mostFavoritedProperties
    };
  }
}
