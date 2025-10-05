import { PaymentMethod, Transaction, CheckoutData, PricingBreakdown } from '../../types/payments';

// Base de datos mock en memoria
const paymentDB = {
  paymentMethods: [] as PaymentMethod[],
  transactions: [] as Transaction[],
  nextId: 1
};

// Funciones CRUD para métodos de pago
export const addPaymentMethod = (paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>): PaymentMethod => {
  const newPaymentMethod: PaymentMethod = {
    ...paymentMethod,
    id: paymentDB.nextId.toString(),
    createdAt: new Date().toISOString()
  };
  
  // Si es el método por defecto, desmarcar otros
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

export const getUserPaymentMethods = (userId: string): PaymentMethod[] => {
  return paymentDB.paymentMethods
    .filter(pm => pm.userId === userId)
    .sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

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

export const getUserTransactions = (userId: string, limit: number = 20): Transaction[] => {
  return paymentDB.transactions
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getTransactionById = (transactionId: string): Transaction | null => {
  return paymentDB.transactions.find(t => t.transactionId === transactionId) || null;
};

// Funciones de validación y cálculo
export const validatePaymentData = (paymentInfo: CheckoutData['paymentInfo']): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validar número de tarjeta (Luhn algorithm simplificado)
  const cardNumber = paymentInfo.cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cardNumber)) {
    errors.push('Número de tarjeta inválido');
  }
  
  // Validar fecha de expiración
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  if (paymentInfo.expiryYear < currentYear || 
      (paymentInfo.expiryYear === currentYear && paymentInfo.expiryMonth < currentMonth)) {
    errors.push('Tarjeta expirada');
  }
  
  // Validar CVV
  if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
    errors.push('CVV inválido');
  }
  
  // Validar nombre del titular
  if (!paymentInfo.cardholderName || paymentInfo.cardholderName.trim().length < 2) {
    errors.push('Nombre del titular requerido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const calculatePricing = (propertyId: string, checkIn: string, checkOut: string, guests: number): PricingBreakdown => {
  // Simular precio base por propiedad
  const basePrice = 1500; // MXN por noche
  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  
  const subtotal = basePrice * nights;
  const cleaningFee = 200;
  const serviceFee = Math.round(subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.08);
  const total = subtotal + cleaningFee + serviceFee + taxes;
  
  return {
    basePrice,
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    taxes,
    total,
    currency: 'MXN'
  };
};

export const processPayment = async (transaction: Transaction): Promise<{ success: boolean; message: string }> => {
  // Simular procesamiento de pago
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular éxito (90% de éxito, 10% de fallo)
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

// Función auxiliar para determinar la marca de tarjeta
export const getCardBrand = (cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' => {
  const number = cardNumber.replace(/\s/g, '');
  
  if (number.startsWith('4')) return 'visa';
  if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
  if (number.startsWith('3')) return 'amex';
  if (number.startsWith('6')) return 'discover';
  
  return 'visa'; // Default
};
