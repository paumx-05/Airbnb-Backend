/**
 * 📦 EXPORTADOR PRINCIPAL DE MODELOS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Exportador principal que mantiene compatibilidad total con la API existente.
 * Usa Factory Pattern para seleccionar entre Mock y MongoDB automáticamente.
 * 
 * 🔧 CARACTERÍSTICAS:
 * - MANTIENE EXACTAMENTE LAS MISMAS FUNCIONES EXPORTADAS
 * - CERO BREAKING CHANGES
 * - Selección automática de implementación
 * - Compatibilidad total con controladores existentes
 */

// 🏭 FACTORIES
import { UserRepositoryFactory } from './factories/UserRepositoryFactory';
import { HostRepositoryFactory } from './factories/HostRepositoryFactory';
import { PropertyRepositoryFactory } from './factories/PropertyRepositoryFactory';
import { ReservationRepositoryFactory } from './factories/ReservationRepositoryFactory';
import { ReviewRepositoryFactory } from './factories/ReviewRepositoryFactory';
import { PaymentRepositoryFactory } from './factories/PaymentRepositoryFactory';
import { CartRepositoryFactory } from './factories/CartRepositoryFactory';
import { FavoriteRepositoryFactory } from './factories/FavoriteRepositoryFactory';
import { NotificationRepositoryFactory } from './factories/NotificationRepositoryFactory';

// 📦 CREAR INSTANCIAS DE REPOSITORIOS
const userRepo = UserRepositoryFactory.create();
const hostRepo = HostRepositoryFactory.create();
const propertyRepo = PropertyRepositoryFactory.create();
const reservationRepo = ReservationRepositoryFactory.create();
const reviewRepo = ReviewRepositoryFactory.create();
const paymentRepo = PaymentRepositoryFactory.create();
const cartRepo = CartRepositoryFactory.create();
const favoriteRepo = FavoriteRepositoryFactory.create();
const notificationRepo = NotificationRepositoryFactory.create();

// =============================================================================
// 👤 FUNCIONES DE USUARIO (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

// 🔍 FUNCIONES DE BÚSQUEDA
export const findUserByEmail = userRepo.findUserByEmail.bind(userRepo);
export const findUserById = userRepo.findById.bind(userRepo);

// ➕ FUNCIONES DE CREACIÓN
export const createUser = userRepo.createUser.bind(userRepo);

// ✏️ FUNCIONES DE ACTUALIZACIÓN
export const updateUser = userRepo.updateUser.bind(userRepo);
export const updateUserPassword = userRepo.updateUserPassword.bind(userRepo);

// 🗑️ FUNCIONES DE ELIMINACIÓN
export const deleteUser = userRepo.deleteUser.bind(userRepo);

// 📋 FUNCIONES DE LISTADO
export const getAllUsers = userRepo.getAllUsers.bind(userRepo);

// 🔐 FUNCIONES DE AUTENTICACIÓN
export const verifyCredentials = userRepo.verifyCredentials.bind(userRepo);

// 🔒 FUNCIONES DE ENCRIPTACIÓN
export const hashPassword = userRepo.hashPassword.bind(userRepo);
export const comparePassword = userRepo.comparePassword.bind(userRepo);
export const isPasswordValid = userRepo.isPasswordValid.bind(userRepo);

// ✅ FUNCIONES DE VALIDACIÓN
export const isEmailAvailable = userRepo.isEmailAvailable.bind(userRepo);

// 🛠️ FUNCIONES DE UTILIDAD
export const removePasswordFromUser = userRepo.removePasswordFromUser.bind(userRepo);

// 📊 FUNCIONES DE ESTADÍSTICAS
export const getUserStats = userRepo.getUserStats.bind(userRepo);

// =============================================================================
// 🏠 FUNCIONES DE HOST (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const createHostProperty = hostRepo.createHostProperty.bind(hostRepo);
export const getHostProperties = hostRepo.getHostProperties.bind(hostRepo);
export const getHostPropertyById = hostRepo.getHostPropertyById.bind(hostRepo);
export const updateHostProperty = hostRepo.updateHostProperty.bind(hostRepo);
export const deleteHostProperty = hostRepo.deleteHostProperty.bind(hostRepo);
export const getHostStats = hostRepo.getHostStats.bind(hostRepo);

// =============================================================================
// 🏘️ FUNCIONES DE PROPIEDADES (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const getPropertyById = propertyRepo.getPropertyById.bind(propertyRepo);
export const searchProperties = propertyRepo.searchProperties.bind(propertyRepo);
export const getPopularLocations = propertyRepo.getPopularLocations.bind(propertyRepo);
export const getAvailableAmenities = propertyRepo.getAvailableAmenities.bind(propertyRepo);

// =============================================================================
// 📅 FUNCIONES DE RESERVAS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const createReservation = reservationRepo.createReservation.bind(reservationRepo);
export const getUserReservations = reservationRepo.getUserReservations.bind(reservationRepo);
export const getPropertyReservations = reservationRepo.getPropertyReservations.bind(reservationRepo);
export const getReservationById = reservationRepo.getReservationById.bind(reservationRepo);
export const updateReservationStatus = reservationRepo.updateReservationStatus.bind(reservationRepo);
export const deleteReservation = reservationRepo.deleteReservation.bind(reservationRepo);
export const checkAvailability = reservationRepo.checkAvailability.bind(reservationRepo);
export const getPropertyAvailability = reservationRepo.getPropertyAvailability.bind(reservationRepo);
export const calculatePrice = reservationRepo.calculatePrice.bind(reservationRepo);

// =============================================================================
// ⭐ FUNCIONES DE REVIEWS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const createReview = reviewRepo.createReview.bind(reviewRepo);
export const getPropertyReviews = reviewRepo.getPropertyReviews.bind(reviewRepo);
export const getUserReviews = reviewRepo.getUserReviews.bind(reviewRepo);
export const getReviewById = reviewRepo.getReviewById.bind(reviewRepo);
export const getAllReviews = reviewRepo.getAllReviews.bind(reviewRepo);
export const updateReview = reviewRepo.updateReview.bind(reviewRepo);
export const deleteReview = reviewRepo.deleteReview.bind(reviewRepo);
export const getPropertyReviewStats = reviewRepo.getPropertyReviewStats.bind(reviewRepo);
export const getReviewStats = reviewRepo.getReviewStats.bind(reviewRepo);

// =============================================================================
// 💳 FUNCIONES DE PAGOS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const addPaymentMethod = paymentRepo.addPaymentMethod.bind(paymentRepo);
export const getUserPaymentMethods = paymentRepo.getUserPaymentMethods.bind(paymentRepo);
export const deletePaymentMethod = paymentRepo.deletePaymentMethod.bind(paymentRepo);
export const createTransaction = paymentRepo.createTransaction.bind(paymentRepo);
export const getUserTransactions = paymentRepo.getUserTransactions.bind(paymentRepo);
export const getTransactionById = paymentRepo.getTransactionById.bind(paymentRepo);
export const updateTransactionStatus = paymentRepo.updateTransactionStatus.bind(paymentRepo);
export const calculatePricing = paymentRepo.calculatePricing.bind(paymentRepo);
export const validatePaymentData = paymentRepo.validatePaymentData.bind(paymentRepo);
export const processPayment = paymentRepo.processPayment.bind(paymentRepo);
export const getCardBrand = paymentRepo.getCardBrand.bind(paymentRepo);

// =============================================================================
// 🛒 FUNCIONES DE CARRITO (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const getCartByUserId = cartRepo.getCartByUserId.bind(cartRepo);
export const addToCart = cartRepo.addToCart.bind(cartRepo);
export const removeFromCart = cartRepo.removeFromCart.bind(cartRepo);
export const updateCartItem = cartRepo.updateCartItem.bind(cartRepo);
export const clearCart = cartRepo.clearCart.bind(cartRepo);
export const getCartItem = cartRepo.getCartItem.bind(cartRepo);
export const getCartSummary = cartRepo.getCartSummary.bind(cartRepo);
export const getCartStats = cartRepo.getCartStats.bind(cartRepo);

// =============================================================================
// ❤️ FUNCIONES DE FAVORITOS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const addFavorite = favoriteRepo.addFavorite.bind(favoriteRepo);
export const removeFavorite = favoriteRepo.removeFavorite.bind(favoriteRepo);
export const getUserFavorites = favoriteRepo.getUserFavorites.bind(favoriteRepo);
export const isFavorite = favoriteRepo.isFavorite.bind(favoriteRepo);
export const createWishlist = favoriteRepo.createWishlist.bind(favoriteRepo);
export const getUserWishlists = favoriteRepo.getUserWishlists.bind(favoriteRepo);
export const getPublicWishlists = favoriteRepo.getPublicWishlists.bind(favoriteRepo);
export const getWishlistById = favoriteRepo.getWishlistById.bind(favoriteRepo);
export const updateWishlist = favoriteRepo.updateWishlist.bind(favoriteRepo);
export const deleteWishlist = favoriteRepo.deleteWishlist.bind(favoriteRepo);
export const addToWishlist = favoriteRepo.addToWishlist.bind(favoriteRepo);
export const removeFromWishlist = favoriteRepo.removeFromWishlist.bind(favoriteRepo);
export const getFavoriteStats = favoriteRepo.getFavoriteStats.bind(favoriteRepo);

// =============================================================================
// 🔔 FUNCIONES DE NOTIFICACIONES (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const createNotification = notificationRepo.createNotification.bind(notificationRepo);
export const getUserNotifications = notificationRepo.getUserNotifications.bind(notificationRepo);
export const markAsRead = notificationRepo.markAsRead.bind(notificationRepo);
export const markAllAsRead = notificationRepo.markAllAsRead.bind(notificationRepo);
export const deleteNotification = notificationRepo.deleteNotification.bind(notificationRepo);
export const clearAllNotifications = notificationRepo.clearAllNotifications.bind(notificationRepo);
export const getNotificationSettings = notificationRepo.getNotificationSettings.bind(notificationRepo);
export const updateNotificationSettings = notificationRepo.updateNotificationSettings.bind(notificationRepo);
export const createTestNotification = notificationRepo.createTestNotification.bind(notificationRepo);
export const getNotificationStats = notificationRepo.getNotificationStats.bind(notificationRepo);

// =============================================================================
// 📦 EXPORTAR TIPOS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export type { CreateUserData, UpdateUserData } from '../types/auth';
export type { HostProperty, HostStats } from '../types/host';
export type { Property, PropertyFilters, SearchResult } from '../types/properties';
export type { Reservation, Availability } from '../types/reservations';
export type { Review, ReviewStats } from '../types/reviews';
export type { PaymentMethod, Transaction, CheckoutData } from '../types/payments';
export type { CartItem, CartData, CartSummary } from '../types/cart';
export type { Favorite, Wishlist } from '../types/favorites';
export type { Notification, NotificationSettings } from '../types/notifications';

// =============================================================================
// 🛠️ FUNCIONES DE UTILIDAD PARA TESTING
// =============================================================================

/**
 * 🔄 Resetea todos los factories (útil para testing)
 */
export const resetAllFactories = (): void => {
  UserRepositoryFactory.reset();
  HostRepositoryFactory.reset();
  PropertyRepositoryFactory.reset();
  ReservationRepositoryFactory.reset();
  ReviewRepositoryFactory.reset();
  PaymentRepositoryFactory.reset();
  CartRepositoryFactory.reset();
  FavoriteRepositoryFactory.reset();
  NotificationRepositoryFactory.reset();
};

/**
 * 🔍 Obtiene el tipo de base de datos actual
 */
export const getCurrentDatabaseType = (): string => {
  return UserRepositoryFactory.getCurrentType();
};
