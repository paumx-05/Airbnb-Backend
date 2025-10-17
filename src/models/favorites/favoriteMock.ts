/**
 * ❤️ MODELO MOCK DE FAVORITOS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Base de datos mock para funcionalidad de favoritos de usuarios y listas de deseos.
 * Gestiona favoritos individuales de propiedades y listas de deseos organizadas con
 * opciones de compartir públicas/privadas. Incluye operaciones CRUD para favoritos
 * y listas de deseos con validación adecuada.
 * 
 * 🔧 IMPORTS Y DEPENDENCIAS:
 * - Favorite: Interfaz de favorito individual de propiedad
 * - Wishlist: Colección organizada de propiedades con configuraciones de compartir
 */

import { Favorite, Wishlist } from '../../types/favorites';

// 💾 BASE DE DATOS MOCK EN MEMORIA
// Almacenamiento temporal para favoritos y listas de deseos (reemplazado por DB real en producción)
const favoritesDB = {
  favorites: [] as Favorite[],
  wishlists: [] as Wishlist[],
  nextFavoriteId: 1,
  nextWishlistId: 1
};

// ❤️ FUNCIONES DE GESTIÓN DE FAVORITOS

/**
 * ➕ Agrega una propiedad a los favoritos del usuario
 * @param userId - ID del usuario que agrega el favorito
 * @param propertyId - ID de la propiedad a marcar como favorita
 * @returns Objeto Favorite (existente o recién creado)
 */
export const addToFavorites = (userId: string, propertyId: string): Favorite => {
  // Check if already favorited to prevent duplicates
  const existing = favoritesDB.favorites.find(f => f.userId === userId && f.propertyId === propertyId);
  if (existing) {
    return existing;
  }

  const favorite: Favorite = {
    id: favoritesDB.nextFavoriteId.toString(),
    userId,
    propertyId,
    createdAt: new Date().toISOString()
  };
  
  favoritesDB.favorites.push(favorite);
  favoritesDB.nextFavoriteId++;
  return favorite;
};

/**
 * ➖ Elimina una propiedad de los favoritos del usuario
 * @param userId - ID del usuario que elimina el favorito
 * @param propertyId - ID de la propiedad a desmarcar como favorita
 * @returns true si se eliminó, false si no se encontró
 */
export const removeFromFavorites = (userId: string, propertyId: string): boolean => {
  const index = favoritesDB.favorites.findIndex(f => f.userId === userId && f.propertyId === propertyId);
  if (index !== -1) {
    favoritesDB.favorites.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * 📋 Obtiene todos los favoritos para un usuario específico
 * @param userId - ID del usuario
 * @returns Array de favoritos ordenados por fecha de creación (más recientes primero)
 */
export const getUserFavorites = (userId: string): Favorite[] => {
  return favoritesDB.favorites
    .filter(f => f.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * ❓ Verifica si una propiedad está marcada como favorita por un usuario
 * @param userId - ID del usuario
 * @param propertyId - ID de la propiedad a verificar
 * @returns true si la propiedad está marcada como favorita, false en caso contrario
 */
export const isPropertyFavorite = (userId: string, propertyId: string): boolean => {
  return favoritesDB.favorites.some(f => f.userId === userId && f.propertyId === propertyId);
};

// 📝 FUNCIONES DE GESTIÓN DE LISTAS DE DESEOS

/**
 * ➕ Crea una nueva lista de deseos para un usuario
 * @param userId - ID del usuario que crea la lista de deseos
 * @param name - Nombre de la lista de deseos
 * @param description - Descripción opcional
 * @param isPublic - Si la lista de deseos es públicamente visible (por defecto false)
 * @returns Objeto de lista de deseos creada
 */
export const createWishlist = (userId: string, name: string, description?: string, isPublic: boolean = false): Wishlist => {
  const wishlist: Wishlist = {
    id: favoritesDB.nextWishlistId.toString(),
    userId,
    name,
    description,
    propertyIds: [],
    isPublic,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  favoritesDB.wishlists.push(wishlist);
  favoritesDB.nextWishlistId++;
  return wishlist;
};

/**
 * 📋 Obtiene todas las listas de deseos para un usuario específico
 * @param userId - ID del usuario
 * @returns Array de listas de deseos ordenadas por fecha de creación (más recientes primero)
 */
export const getUserWishlists = (userId: string): Wishlist[] => {
  return favoritesDB.wishlists
    .filter(w => w.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 🔍 Obtiene una lista de deseos específica por ID
 * @param id - ID de la lista de deseos
 * @param userId - ID del usuario (para validación de propiedad)
 * @returns Wishlist si se encontró y pertenece al usuario, null en caso contrario
 */
export const getWishlistById = (id: string, userId: string): Wishlist | null => {
  return favoritesDB.wishlists.find(w => w.id === id && w.userId === userId) || null;
};

/**
 * ✏️ Actualiza una lista de deseos existente
 * @param id - ID de la lista de deseos
 * @param userId - ID del usuario (para validación de propiedad)
 * @param updates - Datos parciales de lista de deseos a actualizar
 * @returns true si se actualizó, false si no se encontró o no pertenece al usuario
 */
export const updateWishlist = (id: string, userId: string, updates: Partial<Wishlist>): boolean => {
  const wishlist = favoritesDB.wishlists.find(w => w.id === id && w.userId === userId);
  if (wishlist) {
    Object.assign(wishlist, updates);
    wishlist.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

/**
 * 🗑️ Elimina una lista de deseos
 * @param id - ID de la lista de deseos
 * @param userId - ID del usuario (para validación de propiedad)
 * @returns true si se eliminó, false si no se encontró o no pertenece al usuario
 */
export const deleteWishlist = (id: string, userId: string): boolean => {
  const index = favoritesDB.wishlists.findIndex(w => w.id === id && w.userId === userId);
  if (index !== -1) {
    favoritesDB.wishlists.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * ➕ Agrega una propiedad a una lista de deseos
 * @param wishlistId - ID de la lista de deseos
 * @param userId - ID del usuario (para validación de propiedad)
 * @param propertyId - ID de la propiedad a agregar
 * @returns true si se agregó, false si no se encontró la lista o la propiedad ya existe
 */
export const addPropertyToWishlist = (wishlistId: string, userId: string, propertyId: string): boolean => {
  const wishlist = favoritesDB.wishlists.find(w => w.id === wishlistId && w.userId === userId);
  if (wishlist && !wishlist.propertyIds.includes(propertyId)) {
    wishlist.propertyIds.push(propertyId);
    wishlist.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

/**
 * ➖ Elimina una propiedad de una lista de deseos
 * @param wishlistId - ID de la lista de deseos
 * @param userId - ID del usuario (para validación de propiedad)
 * @param propertyId - ID de la propiedad a eliminar
 * @returns true si se eliminó, false si no se encontró la lista o la propiedad no está en la lista
 */
export const removePropertyFromWishlist = (wishlistId: string, userId: string, propertyId: string): boolean => {
  const wishlist = favoritesDB.wishlists.find(w => w.id === wishlistId && w.userId === userId);
  if (wishlist) {
    const index = wishlist.propertyIds.indexOf(propertyId);
    if (index !== -1) {
      wishlist.propertyIds.splice(index, 1);
      wishlist.updatedAt = new Date().toISOString();
      return true;
    }
  }
  return false;
};

/**
 * 🌍 Obtiene todas las listas de deseos públicas para descubrimiento
 * @returns Array de listas de deseos públicas ordenadas por fecha de creación (más recientes primero)
 */
export const getPublicWishlists = (): Wishlist[] => {
  return favoritesDB.wishlists
    .filter(w => w.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 📊 Obtiene conteo básico de listas de deseos para un usuario
 * @param userId - ID del usuario
 * @returns Conteo básico de listas de deseos
 */
export const getWishlistStats = (userId: string) => {
  const wishlists = getUserWishlists(userId);
  
  return {
    totalWishlists: wishlists.length,
    totalProperties: wishlists.reduce((sum, w) => sum + w.propertyIds.length, 0)
  };
};
