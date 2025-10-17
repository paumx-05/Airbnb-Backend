/**
 * 🛒 MODELO MOCK DE CARRITO
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Base de datos mock para el sistema de carrito de reservas. Este archivo proporciona
 * almacenamiento en memoria y lógica de negocio para gestionar carritos de compra de
 * usuarios con reservas de propiedades. Incluye manejo de expiración, verificaciones
 * de disponibilidad y operaciones de gestión del carrito.
 * 
 * 🔧 IMPORTS Y DEPENDENCIAS:
 * - CartItem: Interfaz de item individual del carrito con información de propiedad y fechas
 * - CartData: Estructura completa de datos del carrito con totales y metadatos
 * - CartConfig: Configuraciones de comportamiento y límites del carrito
 */

import { CartItem, CartData, CartConfig } from '../../types/cart';

// ⚙️ CONFIGURACIÓN DEL CARRITO
// Configuraciones que controlan el comportamiento del carrito y reglas de negocio
const cartConfig: CartConfig = {
  maxItemsPerUser: 10,        // Máximo de propiedades por carrito de usuario
  expirationHours: 24,        // Los items del carrito expiran después de 24 horas
  maxGuestsPerProperty: 8,    // Máximo de huéspedes permitidos por propiedad
  minStayNights: 1,           // Noches mínimas requeridas para reserva
  maxStayNights: 30           // Máximo de noches permitidas para reserva
};

// 💾 BASE DE DATOS MOCK EN MEMORIA
// Almacenamiento temporal para items del carrito (reemplazado por DB real en producción)
let cartDatabase: CartItem[] = [];

// 🛠️ FUNCIONES DE UTILIDAD

/**
 * 🔑 Genera ID único para item del carrito
 * @returns ID único de string combinando timestamp y caracteres aleatorios
 */
const generateId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 📅 Calcula noches entre fechas de check-in y check-out
 * @param checkIn - String de fecha de check-in (formato ISO)
 * @param checkOut - String de fecha de check-out (formato ISO)
 * @returns Número de noches entre las fechas
 */
const calculateNights = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * ⏰ Calcula fecha de expiración para items del carrito
 * @param hours - Horas desde ahora cuando expira el item
 * @returns String ISO de fecha de expiración
 */
const calculateExpirationDate = (hours: number): string => {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + hours);
  return expirationDate.toISOString();
};

/**
 * 🧹 Elimina items expirados de la base de datos del carrito
 * Llamado automáticamente antes de operaciones del carrito para mantener integridad de datos
 */
const cleanExpiredItems = (): void => {
  const now = new Date().toISOString();
  cartDatabase = cartDatabase.filter(item => item.expiresAt > now);
};

// 📋 FUNCIONES DE GESTIÓN DEL CARRITO

/**
 * 🛒 Obtiene datos completos del carrito para un usuario específico
 * @param userId - ID del usuario cuyo carrito obtener
 * @returns Objeto CartData con items, totales y metadatos
 */
export const getCartByUserId = (userId: string): CartData => {
  cleanExpiredItems(); // Remove expired items first
  
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

/**
 * ➕ Agrega una nueva reserva de propiedad al carrito del usuario
 * @param userId - ID del usuario que agrega el item
 * @param itemData - Datos de reserva de propiedad (sin campos calculados)
 * @returns CartItem con ID generado, totales y fecha de expiración
 * @throws Error si se alcanza límite del carrito o existe item duplicado
 */
export const addToCart = (userId: string, itemData: Omit<CartItem, 'id' | 'userId' | 'createdAt' | 'expiresAt' | 'totalNights' | 'totalPrice'>): CartItem => {
  cleanExpiredItems();
  
  // Check user's cart limit to prevent abuse
  const userItems = cartDatabase.filter(item => item.userId === userId);
  if (userItems.length >= cartConfig.maxItemsPerUser) {
    throw new Error(`Límite máximo de ${cartConfig.maxItemsPerUser} items por usuario alcanzado`);
  }
  
  // Prevent duplicate reservations for same property and dates
  const existingItem = cartDatabase.find(item => 
    item.userId === userId && 
    item.propertyId === itemData.propertyId &&
    item.checkIn === itemData.checkIn &&
    item.checkOut === itemData.checkOut
  );
  
  if (existingItem) {
    throw new Error('Ya existe una reserva similar en el carrito');
  }
  
  // Calculate pricing and duration
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

/**
 * ➖ Elimina un item específico del carrito del usuario
 * @param userId - ID del usuario que elimina el item
 * @param itemId - ID del item del carrito a eliminar
 * @returns true si el item fue eliminado, false si no se encontró
 */
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

/**
 * ✏️ Actualiza un item existente del carrito con nuevos datos
 * @param userId - ID del usuario que actualiza el item
 * @param itemId - ID del item del carrito a actualizar
 * @param updates - Datos parciales a actualizar (fechas, huéspedes, precio)
 * @returns CartItem actualizado o null si no se encontró
 */
export const updateCartItem = (userId: string, itemId: string, updates: Partial<Omit<CartItem, 'id' | 'userId' | 'createdAt' | 'expiresAt'>>): CartItem | null => {
  cleanExpiredItems();
  
  const itemIndex = cartDatabase.findIndex(item => 
    item.id === itemId && item.userId === userId
  );
  
  if (itemIndex === -1) {
    return null;
  }
  
  const item = cartDatabase[itemIndex];
  
  // Update individual fields
  if (updates.checkIn) item.checkIn = updates.checkIn;
  if (updates.checkOut) item.checkOut = updates.checkOut;
  if (updates.guests) item.guests = updates.guests;
  if (updates.pricePerNight) item.pricePerNight = updates.pricePerNight;
  
  // Recalculate totals if dates or price changed
  if (updates.checkIn || updates.checkOut || updates.pricePerNight) {
    item.totalNights = calculateNights(item.checkIn, item.checkOut);
    item.totalPrice = item.totalNights * item.pricePerNight;
  }
  
  // Reset expiration date when item is modified
  item.expiresAt = calculateExpirationDate(cartConfig.expirationHours);
  
  cartDatabase[itemIndex] = item;
  return item;
};

/**
 * 🗑️ Limpia todos los items del carrito del usuario
 * @param userId - ID del usuario cuyo carrito limpiar
 * @returns true si se eliminaron items, false si el carrito ya estaba vacío
 */
export const clearCart = (userId: string): boolean => {
  cleanExpiredItems();
  
  const initialLength = cartDatabase.length;
  cartDatabase = cartDatabase.filter(item => item.userId !== userId);
  
  return cartDatabase.length < initialLength;
};

/**
 * 🔍 Obtiene un item específico del carrito por ID
 * @param userId - ID del usuario propietario del item
 * @param itemId - ID del item del carrito a obtener
 * @returns CartItem si se encontró, null en caso contrario
 */
export const getCartItem = (userId: string, itemId: string): CartItem | null => {
  cleanExpiredItems();
  
  return cartDatabase.find(item => 
    item.id === itemId && item.userId === userId
  ) || null;
};

/**
 * 📊 Obtiene estadísticas resumen del carrito del usuario
 * @param userId - ID del usuario
 * @returns Objeto con totales y conteo de items
 */
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

/**
 * ✅ Verifica disponibilidad básica en el carrito
 * @param propertyId - ID de la propiedad a verificar
 * @param checkIn - Fecha de check-in
 * @param checkOut - Fecha de check-out
 * @returns true si está disponible, false si hay conflictos
 */
export const checkAvailability = (propertyId: string, checkIn: string, checkOut: string): boolean => {
  cleanExpiredItems();
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  if (checkInDate >= checkOutDate) return false;
  
  return !cartDatabase.some(item => 
    item.propertyId === propertyId &&
    new Date(item.checkIn) < checkOutDate &&
    new Date(item.checkOut) > checkInDate
  );
};

/**
 * ⚙️ Obtiene configuraciones actuales del carrito
 * @returns Copia del objeto de configuración del carrito
 */
export const getCartConfig = (): CartConfig => {
  return { ...cartConfig };
};

/**
 * 🧹 Función de mantenimiento para limpiar todos los items expirados
 * @returns Número de items que fueron eliminados
 */
export const cleanAllExpiredItems = (): number => {
  const initialLength = cartDatabase.length;
  cleanExpiredItems();
  return initialLength - cartDatabase.length;
};

/**
 * 📊 Obtiene estadísticas básicas del carrito
 * @returns Objeto con conteos básicos del carrito
 */
export const getCartStats = () => {
  cleanExpiredItems();
  
  return {
    totalItems: cartDatabase.length,
    totalUsers: new Set(cartDatabase.map(item => item.userId)).size
  };
};
