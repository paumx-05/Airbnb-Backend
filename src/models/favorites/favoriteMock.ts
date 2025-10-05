import { Favorite, Wishlist } from '../../types/favorites';

// Base de datos mock de favoritos y wishlists
const favoritesDB = {
  favorites: [] as Favorite[],
  wishlists: [] as Wishlist[],
  nextFavoriteId: 1,
  nextWishlistId: 1
};

// Funciones para favoritos
export const addToFavorites = (userId: string, propertyId: string): Favorite => {
  // Verificar si ya existe
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

export const removeFromFavorites = (userId: string, propertyId: string): boolean => {
  const index = favoritesDB.favorites.findIndex(f => f.userId === userId && f.propertyId === propertyId);
  if (index !== -1) {
    favoritesDB.favorites.splice(index, 1);
    return true;
  }
  return false;
};

export const getUserFavorites = (userId: string): Favorite[] => {
  return favoritesDB.favorites
    .filter(f => f.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const isPropertyFavorite = (userId: string, propertyId: string): boolean => {
  return favoritesDB.favorites.some(f => f.userId === userId && f.propertyId === propertyId);
};

// Funciones para wishlists
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

export const getUserWishlists = (userId: string): Wishlist[] => {
  return favoritesDB.wishlists
    .filter(w => w.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getWishlistById = (id: string, userId: string): Wishlist | null => {
  return favoritesDB.wishlists.find(w => w.id === id && w.userId === userId) || null;
};

export const updateWishlist = (id: string, userId: string, updates: Partial<Wishlist>): boolean => {
  const wishlist = favoritesDB.wishlists.find(w => w.id === id && w.userId === userId);
  if (wishlist) {
    Object.assign(wishlist, updates);
    wishlist.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

export const deleteWishlist = (id: string, userId: string): boolean => {
  const index = favoritesDB.wishlists.findIndex(w => w.id === id && w.userId === userId);
  if (index !== -1) {
    favoritesDB.wishlists.splice(index, 1);
    return true;
  }
  return false;
};

export const addPropertyToWishlist = (wishlistId: string, userId: string, propertyId: string): boolean => {
  const wishlist = favoritesDB.wishlists.find(w => w.id === wishlistId && w.userId === userId);
  if (wishlist && !wishlist.propertyIds.includes(propertyId)) {
    wishlist.propertyIds.push(propertyId);
    wishlist.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

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

export const getPublicWishlists = (): Wishlist[] => {
  return favoritesDB.wishlists
    .filter(w => w.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getWishlistStats = (userId: string): {
  totalWishlists: number;
  totalProperties: number;
  publicWishlists: number;
} => {
  const wishlists = getUserWishlists(userId);
  const totalWishlists = wishlists.length;
  const totalProperties = wishlists.reduce((sum, w) => sum + w.propertyIds.length, 0);
  const publicWishlists = wishlists.filter(w => w.isPublic).length;

  return {
    totalWishlists,
    totalProperties,
    publicWishlists
  };
};
