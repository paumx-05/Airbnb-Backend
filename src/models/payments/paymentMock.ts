/**
 * 💳 MODELO MOCK DE PAGOS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Base de datos mock para el sistema de procesamiento de pagos. Maneja métodos de pago,
 * transacciones, cálculos de precios y validación de pagos. Incluye validación de tarjetas,
 * desgloses de precios y procesamiento simulado de pagos con escenarios de éxito/fallo.
 * 
 * 🔧 IMPORTS Y DEPENDENCIAS:
 * - PaymentMethod: Interfaz de métodos de pago guardados del usuario
 * - Transaction: Registro de transacción de pago con seguimiento de estado
 * - CheckoutData: Estructura completa de información de checkout
 * - PricingBreakdown: Desglose detallado de cálculo de precios
 */

import { PaymentMethod, Transaction, CheckoutData, PricingBreakdown } from '../../types/payments';

// 💾 BASE DE DATOS MOCK EN MEMORIA
// Almacenamiento temporal para datos de pago (reemplazado por DB real en producción)
const paymentDB = {
  paymentMethods: [] as PaymentMethod[],
  transactions: [] as Transaction[],
  nextId: 1
};

// 💳 GESTIÓN DE MÉTODOS DE PAGO

/**
 * ➕ Agrega un nuevo método de pago para el usuario
 * @param paymentMethod - Datos del método de pago sin ID y timestamps
 * @returns PaymentMethod con ID generado y timestamp de creación
 */
export const addPaymentMethod = (paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>): PaymentMethod => {
  const newPaymentMethod: PaymentMethod = {
    ...paymentMethod,
    id: paymentDB.nextId.toString(),
    createdAt: new Date().toISOString()
  };
  
  // If this is set as default, unset other default methods for this user
  if (newPaymentMethod.isDefault) {
    paymentDB.paymentMethods.forEach(method => {
      if (method.userId === newPaymentMethod.userId) {
        method.isDefault = false;
      }
    });
  }
  
  paymentDB.paymentMethods.push(newPaymentMethod);
  paymentDB.nextId++;
  return newPaymentMethod;
};

/**
 * 📋 Obtiene todos los métodos de pago para un usuario específico
 * @param userId - ID del usuario
 * @returns Array de métodos de pago ordenados por defecto primero, luego por fecha de creación
 */
export const getUserPaymentMethods = (userId: string): PaymentMethod[] => {
  return paymentDB.paymentMethods
    .filter(pm => pm.userId === userId)
    .sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

/**
 * 💸 Crea un nuevo registro de transacción de pago
 * @param transaction - Datos de transacción sin campos generados
 * @returns Transaction con ID generado, ID de transacción y timestamps
 */
export const createTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'transactionId'>): Transaction => {
  const newTransaction: Transaction = {
    ...transaction,
    id: paymentDB.nextId.toString(),
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  paymentDB.transactions.push(newTransaction);
  paymentDB.nextId++;
  return newTransaction;
};

/**
 * 🔄 Actualiza estado de transacción y razón de fallo
 * @param transactionId - Identificador único de transacción
 * @param status - Nuevo estado de transacción
 * @param failureReason - Razón opcional de fallo
 * @returns true si la transacción fue actualizada, false si no se encontró
 */
export const updateTransactionStatus = (transactionId: string, status: Transaction['status'], failureReason?: string): boolean => {
  const transaction = paymentDB.transactions.find(t => t.transactionId === transactionId);
  if (transaction) {
    transaction.status = status;
    transaction.updatedAt = new Date().toISOString();
    if (failureReason) {
      transaction.failureReason = failureReason;
    }
    return true;
  }
  return false;
};

/**
 * 📊 Obtiene historial de transacciones del usuario
 * @param userId - ID del usuario
 * @param limit - Número máximo de transacciones a retornar (por defecto 20)
 * @returns Array de transacciones ordenadas por fecha de creación (más recientes primero)
 */
export const getUserTransactions = (userId: string, limit: number = 20): Transaction[] => {
  return paymentDB.transactions
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

/**
 * 🔍 Obtiene una transacción específica por ID
 * @param transactionId - Identificador único de transacción
 * @returns Transaction si se encontró, null en caso contrario
 */
export const getTransactionById = (transactionId: string): Transaction | null => {
  return paymentDB.transactions.find(t => t.transactionId === transactionId) || null;
};

// 🔐 FUNCIONES DE VALIDACIÓN Y CÁLCULO

/**
 * ✅ Valida información básica de tarjeta de pago
 * @param paymentInfo - Detalles de tarjeta a validar
 * @returns true si es válida, false si no
 */
export const validatePaymentData = (paymentInfo: CheckoutData['paymentInfo']): boolean => {
  const cardNumber = paymentInfo.cardNumber.replace(/\s/g, '');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  return (
    /^\d{13,19}$/.test(cardNumber) &&
    !(paymentInfo.expiryYear < currentYear || 
      (paymentInfo.expiryYear === currentYear && paymentInfo.expiryMonth < currentMonth)) &&
    /^\d{3,4}$/.test(paymentInfo.cvv) &&
    Boolean(paymentInfo.cardholderName && paymentInfo.cardholderName.trim().length >= 2)
  );
};

/**
 * 💰 Calcula precios básicos para una reserva
 * @param checkIn - Fecha de check-in
 * @param checkOut - Fecha de check-out
 * @returns Desglose básico de precios
 */
export const calculatePricing = (checkIn: string, checkOut: string): PricingBreakdown => {
  const basePrice = 1500; // MXN per night
  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  
  const subtotal = basePrice * nights;
  const cleaningFee = 200;
  const serviceFee = Math.round(subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.08);
  
  return {
    basePrice,
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    taxes,
    total: subtotal + cleaningFee + serviceFee + taxes,
    currency: 'MXN'
  };
};

/**
 * 🔄 Simula procesamiento de pago con retrasos realistas
 * @param transaction - Transacción a procesar
 * @returns Promise con resultado de procesamiento y mensaje de estado
 */
export const processPayment = async (transaction: Transaction): Promise<{ success: boolean; message: string }> => {
  // Simulate payment processing delay (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate realistic success rate (90% success, 10% failure)
  const isSuccess = Math.random() > 0.1;
  
  if (isSuccess) {
    updateTransactionStatus(transaction.transactionId, 'completed');
    return {
      success: true,
      message: 'Pago procesado exitosamente'
    };
  } else {
    updateTransactionStatus(transaction.transactionId, 'failed', 'Error del procesador de pagos');
    return {
      success: false,
      message: 'Error procesando el pago. Intenta con otro método.'
    };
  }
};

/**
 * 🏷️ Determina marca de tarjeta basada en el número de tarjeta
 * @param cardNumber - String del número de tarjeta
 * @returns Tipo de marca de tarjeta basado en el primer dígito
 */
export const getCardBrand = (cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' => {
  const number = cardNumber.replace(/\s/g, '');
  
  if (number.startsWith('4')) return 'visa';
  if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
  if (number.startsWith('3')) return 'amex';
  if (number.startsWith('6')) return 'discover';
  
  return 'visa'; // Default fallback
};
