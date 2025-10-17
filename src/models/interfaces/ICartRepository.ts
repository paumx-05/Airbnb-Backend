/**
 * 🎯 INTERFAZ DE REPOSITORIO DE CARRITO
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Interfaz que define el contrato para todas las operaciones de carrito.
 * Garantiza compatibilidad entre implementaciones Mock y MongoDB.
 */

import { CartItem, CartData, CartSummary } from '../../types/cart';

export interface ICartRepository {
  // 🛒 FUNCIONES DE CARRITO
  getCartByUserId(userId: string): Promise<CartData>;
  addToCart(userId: string, item: Omit<CartItem, 'id' | 'createdAt' | 'expiresAt'>): Promise<CartItem>;
  removeFromCart(userId: string, itemId: string): Promise<boolean>;
  updateCartItem(userId: string, itemId: string, updates: Partial<CartItem>): Promise<CartItem | null>;
  clearCart(userId: string): Promise<boolean>;
  
  // 🔍 FUNCIONES DE BÚSQUEDA
  getCartItem(userId: string, itemId: string): Promise<CartItem | null>;
  getCartSummary(userId: string): Promise<CartSummary>;
  
  // ✅ FUNCIONES DE VALIDACIÓN
  checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean>;
  
  // 📊 FUNCIONES DE ESTADÍSTICAS
  getCartStats(): Promise<{
    totalCarts: number;
    totalItems: number;
    averageItemsPerCart: number;
    expiredItems: number;
  }>;
}
