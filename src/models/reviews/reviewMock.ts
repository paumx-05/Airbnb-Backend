/**
 * ⭐ MODELO MOCK DE RESEÑAS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Base de datos mock para sistema de reseñas y calificaciones de propiedades. Maneja
 * creación de reseñas, obtención y cálculo de estadísticas. Incluye desgloses detallados
 * de calificaciones por categorías (limpieza, comunicación, check-in, etc.) y estadísticas generales.
 * 
 * 🔧 IMPORTS Y DEPENDENCIAS:
 * - Review: Interfaz de reseña individual con calificaciones detalladas
 * - ReviewStats: Estadísticas agregadas de reseñas para propiedades
 */

import { Review, ReviewStats } from '../../types/reviews';

// 💾 BASE DE DATOS MOCK EN MEMORIA
// Almacenamiento temporal para reseñas (reemplazado por DB real en producción)
const reviewDB = {
  reviews: [] as Review[],
  nextId: 1
};

// ⭐ FUNCIONES DE GESTIÓN DE RESEÑAS

/**
 * ➕ Crea una nueva reseña de propiedad
 * @param review - Datos de reseña sin ID y timestamp de creación
 * @returns Review con ID generado y timestamp de creación
 */
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

/**
 * 🏠 Obtiene todas las reseñas para una propiedad específica
 * @param propertyId - ID de la propiedad
 * @param limit - Número máximo de reseñas a retornar (por defecto 10)
 * @returns Array de reseñas ordenadas por fecha de creación (más recientes primero)
 */
export const getPropertyReviews = (propertyId: string, limit: number = 10): Review[] => {
  return reviewDB.reviews
    .filter(r => r.propertyId === propertyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

/**
 * 👤 Obtiene todas las reseñas escritas por un usuario específico
 * @param userId - ID del usuario
 * @returns Array de reseñas de usuario ordenadas por fecha de creación (más recientes primero)
 */
export const getUserReviews = (userId: string): Review[] => {
  return reviewDB.reviews
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 🔍 Obtiene una reseña específica por ID
 * @param id - ID de la reseña
 * @returns Review si se encontró, null en caso contrario
 */
export const getReviewById = (id: string): Review | null => {
  return reviewDB.reviews.find(r => r.id === id) || null;
};

/**
 * 📊 Calcula estadísticas básicas de reseñas para una propiedad
 * @param propertyId - ID de la propiedad
 * @returns Estadísticas básicas de reseñas
 */
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
  
  return {
    propertyId,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    categoryAverages: {
      cleanliness: Math.round(reviews.reduce((sum, r) => sum + r.categories.cleanliness, 0) / reviews.length * 10) / 10,
      communication: Math.round(reviews.reduce((sum, r) => sum + r.categories.communication, 0) / reviews.length * 10) / 10,
      checkin: Math.round(reviews.reduce((sum, r) => sum + r.categories.checkin, 0) / reviews.length * 10) / 10,
      accuracy: Math.round(reviews.reduce((sum, r) => sum + r.categories.accuracy, 0) / reviews.length * 10) / 10,
      location: Math.round(reviews.reduce((sum, r) => sum + r.categories.location, 0) / reviews.length * 10) / 10,
      value: Math.round(reviews.reduce((sum, r) => sum + r.categories.value, 0) / reviews.length * 10) / 10
    }
  };
};

/**
 * 🌍 Obtiene todas las reseñas de todas las propiedades (función de admin)
 * @returns Array de todas las reseñas ordenadas por fecha de creación (más recientes primero)
 */
export const getAllReviews = (): Review[] => {
  return reviewDB.reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 📈 Obtiene estadísticas globales básicas de reseñas
 * @returns Estadísticas básicas globales
 */
export const getReviewStats = () => {
  const total = reviewDB.reviews.length;
  const averageRating = total > 0 ? reviewDB.reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

  return {
    total,
    averageRating: Math.round(averageRating * 10) / 10
  };
};

/**
 * ✏️ Actualiza una reseña existente
 * @param id - ID de la reseña
 * @param updates - Datos parciales de reseña a actualizar
 * @returns true si se actualizó, false si no se encontró la reseña
 */
export const updateReview = (id: string, updates: Partial<Review>): boolean => {
  const review = reviewDB.reviews.find(r => r.id === id);
  if (review) {
    Object.assign(review, updates);
    return true;
  }
  return false;
};

/**
 * 🗑️ Elimina una reseña
 * @param id - ID de la reseña
 * @returns true si se eliminó, false si no se encontró la reseña
 */
export const deleteReview = (id: string): boolean => {
  const index = reviewDB.reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    reviewDB.reviews.splice(index, 1);
    return true;
  }
  return false;
};
