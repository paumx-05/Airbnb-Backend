// src/models/cart/cartMock.ts
// Base de datos mock para el sistema de carrito de reservas

import { CartItem, CartData, CartConfig } from '../../types/cart';

// Configuración del carrito
const cartConfig: CartConfig = {
  maxItemsPerUser: 10,
  expirationHours: 24,
  maxGuestsPerProperty: 8,
  minStayNights: 1,
  maxStayNights: 30
};

// Base de datos mock en memoria
let cartDatabase: CartItem[] = [];

// Función para generar ID único
const generateId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Función para calcular noches entre fechas
const calculateNights = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Función para calcular fecha de expiración
const calculateExpirationDate = (hours: number): string => {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + hours);
  return expirationDate.toISOString();
};

// Función para limpiar items expirados
const cleanExpiredItems = (): void => {
  const now = new Date().toISOString();
  cartDatabase = cartDatabase.filter(item => item.expiresAt > now);
};

// Función para obtener carrito de un usuario
export const getCartByUserId = (userId: string): CartData => {
  cleanExpiredItems();
  
  const userItems = cartDatabase.filter(item => item.userId === userId);
  const totalPrice = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = userItems.length;
  
  return {
    userId,
    items: userItems,
    totalItems,
    totalPrice,
    lastUpdated: new Date().toISOString()
  };
};

// Función para agregar item al carrito
export const addToCart = (userId: string, itemData: Omit<CartItem, 'id' | 'userId' | 'createdAt' | 'expiresAt' | 'totalNights' | 'totalPrice'>): CartItem => {
  cleanExpiredItems();
  
  // Verificar límite de items por usuario
  const userItems = cartDatabase.filter(item => item.userId === userId);
  if (userItems.length >= cartConfig.maxItemsPerUser) {
    throw new Error(`Límite máximo de ${cartConfig.maxItemsPerUser} items por usuario alcanzado`);
  }
  
  // Verificar si ya existe un item similar
  const existingItem = cartDatabase.find(item => 
    item.userId === userId && 
    item.propertyId === itemData.propertyId &&
    item.checkIn === itemData.checkIn &&
    item.checkOut === itemData.checkOut
  );
  
  if (existingItem) {
    throw new Error('Ya existe una reserva similar en el carrito');
  }
  
  const totalNights = calculateNights(itemData.checkIn, itemData.checkOut);
  const totalPrice = totalNights * itemData.pricePerNight;
  
  const newItem: CartItem = {
    id: generateId(),
    userId,
    ...itemData,
    totalNights,
    totalPrice,
    createdAt: new Date().toISOString(),
    expiresAt: calculateExpirationDate(cartConfig.expirationHours)
  };
  
  cartDatabase.push(newItem);
  return newItem;
};

// Función para eliminar item del carrito
export const removeFromCart = (userId: string, itemId: string): boolean => {
  cleanExpiredItems();
  
  const itemIndex = cartDatabase.findIndex(item => 
    item.id === itemId && item.userId === userId
  );
  
  if (itemIndex === -1) {
    return false;
  }
  
  cartDatabase.splice(itemIndex, 1);
  return true;
};

// Función para actualizar item del carrito
export const updateCartItem = (userId: string, itemId: string, updates: Partial<Omit<CartItem, 'id' | 'userId' | 'createdAt' | 'expiresAt'>>): CartItem | null => {
  cleanExpiredItems();
  
  const itemIndex = cartDatabase.findIndex(item => 
    item.id === itemId && item.userId === userId
  );
  
  if (itemIndex === -1) {
    return null;
  }
  
  const item = cartDatabase[itemIndex];
  
  // Actualizar campos
  if (updates.checkIn) item.checkIn = updates.checkIn;
  if (updates.checkOut) item.checkOut = updates.checkOut;
  if (updates.guests) item.guests = updates.guests;
  if (updates.pricePerNight) item.pricePerNight = updates.pricePerNight;
  
  // Recalcular totales si las fechas o precio cambiaron
  if (updates.checkIn || updates.checkOut || updates.pricePerNight) {
    item.totalNights = calculateNights(item.checkIn, item.checkOut);
    item.totalPrice = item.totalNights * item.pricePerNight;
  }
  
  // Actualizar fecha de expiración
  item.expiresAt = calculateExpirationDate(cartConfig.expirationHours);
  
  cartDatabase[itemIndex] = item;
  return item;
};

// Función para limpiar carrito completo
export const clearCart = (userId: string): boolean => {
  cleanExpiredItems();
  
  const initialLength = cartDatabase.length;
  cartDatabase = cartDatabase.filter(item => item.userId !== userId);
  
  return cartDatabase.length < initialLength;
};

// Función para obtener item específico
export const getCartItem = (userId: string, itemId: string): CartItem | null => {
  cleanExpiredItems();
  
  return cartDatabase.find(item => 
    item.id === itemId && item.userId === userId
  ) || null;
};

// Función para obtener resumen del carrito
export const getCartSummary = (userId: string) => {
  cleanExpiredItems();
  
  const userItems = cartDatabase.filter(item => item.userId === userId);
  const totalPrice = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalNights = userItems.reduce((sum, item) => sum + item.totalNights, 0);
  
  return {
    totalItems: userItems.length,
    totalPrice,
    totalNights,
    items: userItems
  };
};

// Función para verificar disponibilidad
export const checkAvailability = (propertyId: string, checkIn: string, checkOut: string): boolean => {
  cleanExpiredItems();
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Verificar que las fechas sean válidas
  if (checkInDate >= checkOutDate) {
    return false;
  }
  
  // Verificar que no haya conflictos con otros items del carrito
  const conflictingItems = cartDatabase.filter(item => {
    if (item.propertyId !== propertyId) return false;
    
    const itemCheckIn = new Date(item.checkIn);
    const itemCheckOut = new Date(item.checkOut);
    
    // Verificar solapamiento de fechas
    return (checkInDate < itemCheckOut && checkOutDate > itemCheckIn);
  });
  
  return conflictingItems.length === 0;
};

// Función para obtener configuración del carrito
export const getCartConfig = (): CartConfig => {
  return { ...cartConfig };
};

// Función para limpiar todos los items expirados (para mantenimiento)
export const cleanAllExpiredItems = (): number => {
  const initialLength = cartDatabase.length;
  cleanExpiredItems();
  return initialLength - cartDatabase.length;
};

// Función para obtener estadísticas del carrito
export const getCartStats = () => {
  cleanExpiredItems();
  
  const totalItems = cartDatabase.length;
  const totalUsers = new Set(cartDatabase.map(item => item.userId)).size;
  const totalValue = cartDatabase.reduce((sum, item) => sum + item.totalPrice, 0);
  
  return {
    totalItems,
    totalUsers,
    totalValue,
    averageItemsPerUser: totalUsers > 0 ? totalItems / totalUsers : 0,
    averageValuePerItem: totalItems > 0 ? totalValue / totalItems : 0
  };
};
