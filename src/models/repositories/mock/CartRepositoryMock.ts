/**
 * 🎯 REPOSITORY MOCK DE CARRITO
 */

import { ICartRepository } from '../../interfaces/ICartRepository';
import { CartItem, CartData, CartSummary } from '../../../types/cart';

export class CartRepositoryMock implements ICartRepository {
  private cartDB = {
    items: [] as CartItem[],
    nextId: 1
  };

  async getCartByUserId(userId: string): Promise<CartData> {
    const userItems = this.cartDB.items.filter(item => item.userId === userId);
    const total = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    return {
      userId,
      items: userItems,
      totalItems: userItems.length,
      totalPrice: total,
      lastUpdated: new Date().toISOString()
    };
  }

  async addToCart(userId: string, item: Omit<CartItem, 'id' | 'createdAt' | 'expiresAt'>): Promise<CartItem> {
    const newItem: CartItem = {
      ...item,
      id: this.cartDB.nextId.toString(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };
    this.cartDB.items.push(newItem);
    this.cartDB.nextId++;
    return newItem;
  }

  async removeFromCart(userId: string, itemId: string): Promise<boolean> {
    const itemIndex = this.cartDB.items.findIndex(item => 
      item.id === itemId && item.userId === userId
    );
    if (itemIndex === -1) return false;
    
    this.cartDB.items.splice(itemIndex, 1);
    return true;
  }

  async updateCartItem(userId: string, itemId: string, updates: Partial<CartItem>): Promise<CartItem | null> {
    const itemIndex = this.cartDB.items.findIndex(item => 
      item.id === itemId && item.userId === userId
    );
    if (itemIndex === -1) return null;
    
    this.cartDB.items[itemIndex] = {
      ...this.cartDB.items[itemIndex],
      ...updates
    };
    return this.cartDB.items[itemIndex];
  }

  async clearCart(userId: string): Promise<boolean> {
    const initialLength = this.cartDB.items.length;
    this.cartDB.items = this.cartDB.items.filter(item => item.userId !== userId);
    return this.cartDB.items.length < initialLength;
  }

  async getCartItem(userId: string, itemId: string): Promise<CartItem | null> {
    return this.cartDB.items.find(item => 
      item.id === itemId && item.userId === userId
    ) || null;
  }

  async getCartSummary(userId: string): Promise<CartSummary> {
    const userItems = this.cartDB.items.filter(item => item.userId === userId);
    const totalPrice = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalNights = userItems.reduce((sum, item) => sum + item.totalNights, 0);

    return {
      totalItems: userItems.length,
      totalPrice,
      totalNights,
      items: userItems
    };
  }

  async checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean> {
    // Simular verificación de disponibilidad
    return true;
  }

  async getCartStats(): Promise<{
    totalCarts: number;
    totalItems: number;
    averageItemsPerCart: number;
    expiredItems: number;
  }> {
    const now = new Date();
    const expiredItems = this.cartDB.items.filter(item => 
      new Date(item.expiresAt) < now
    ).length;

    const userCarts = new Set(this.cartDB.items.map(item => item.userId)).size;
    const totalItems = this.cartDB.items.length;
    const averageItemsPerCart = userCarts > 0 ? totalItems / userCarts : 0;

    return {
      totalCarts: userCarts,
      totalItems,
      averageItemsPerCart: Math.round(averageItemsPerCart * 100) / 100,
      expiredItems
    };
  }
}
