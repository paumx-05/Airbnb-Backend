import { Request, Response } from 'express';
import { 
  addPaymentMethod, 
  getUserPaymentMethods, 
  createTransaction, 
  getUserTransactions,
  getTransactionById,
  validatePaymentData,
  calculatePricing,
  processPayment,
  updateTransactionStatus,
  getCardBrand
} from '../../models/payments/paymentMock';
import { createReservation } from '../../models/reservations/reservationMock';
import { createNotification } from '../../models/notifications/notificationMock';
import { CheckoutData } from '../../types/payments';

// POST /api/payments/checkout/calculate
export const calculateCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    // Validaciones básicas
    if (!propertyId || !checkIn || !checkOut || !guests) {
      res.status(400).json({
        success: false,
        error: { message: 'Faltan datos requeridos para el cálculo' }
      });
      return;
    }

    const pricing = calculatePricing(propertyId, checkIn, checkOut, guests);

    res.json({
      success: true,
      data: {
        pricing,
        breakdown: {
          nights: pricing.nights,
          basePrice: pricing.basePrice,
          subtotal: pricing.subtotal,
          cleaningFee: pricing.cleaningFee,
          serviceFee: pricing.serviceFee,
          taxes: pricing.taxes,
          total: pricing.total,
          currency: pricing.currency
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error calculando el total' }
    });
  }
};

// POST /api/payments/checkout/process
export const processCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const checkoutData: CheckoutData = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validar datos de pago
    const paymentValidation = validatePaymentData(checkoutData.paymentInfo);
    if (!paymentValidation.isValid) {
      res.status(400).json({
        success: false,
        error: { 
          message: 'Datos de pago inválidos',
          details: paymentValidation.errors
        }
      });
      return;
    }

    // Calcular pricing
    const pricing = calculatePricing(
      checkoutData.propertyId,
      checkoutData.checkIn,
      checkoutData.checkOut,
      checkoutData.guests
    );

    // Crear método de pago
    const paymentMethod = addPaymentMethod({
      userId,
      type: 'credit_card',
      cardNumber: `****${checkoutData.paymentInfo.cardNumber.slice(-4)}`,
      cardBrand: getCardBrand(checkoutData.paymentInfo.cardNumber),
      expiryMonth: checkoutData.paymentInfo.expiryMonth,
      expiryYear: checkoutData.paymentInfo.expiryYear,
      cardholderName: checkoutData.paymentInfo.cardholderName,
      isDefault: true
    });

    // Crear transacción
    const transaction = createTransaction({
      userId,
      reservationId: '', // Se asignará después
      propertyId: checkoutData.propertyId,
      amount: pricing.total,
      currency: pricing.currency,
      status: 'pending',
      paymentMethod,
      description: `Reserva para propiedad ${checkoutData.propertyId}`
    });

    // Procesar pago
    const paymentResult = await processPayment(transaction);

    if (paymentResult.success) {
      // Crear reserva
      const reservation = createReservation({
        propertyId: checkoutData.propertyId,
        userId,
        hostId: 'host-1', // Mock host ID
        checkIn: checkoutData.checkIn,
        checkOut: checkoutData.checkOut,
        guests: checkoutData.guests,
        totalPrice: pricing.total,
        status: 'confirmed',
        specialRequests: checkoutData.guestInfo.specialRequests,
        paymentStatus: 'paid'
      });

      // Actualizar transacción con ID de reserva
      transaction.reservationId = reservation.id;
      updateTransactionStatus(transaction.transactionId, 'completed');

      // Crear notificación de confirmación
      createNotification({
        userId,
        type: 'booking',
        title: 'Reserva confirmada',
        message: `Tu reserva para ${checkoutData.checkIn} ha sido confirmada exitosamente.`,
        isRead: false,
        priority: 'high',
        data: {
          reservationId: reservation.id,
          transactionId: transaction.transactionId
        }
      });

      res.json({
        success: true,
        data: {
          reservation,
          transaction,
          paymentMethod,
          message: 'Reserva procesada exitosamente'
        }
      });
    } else {
      updateTransactionStatus(transaction.transactionId, 'failed', paymentResult.message);
      
      res.status(400).json({
        success: false,
        error: { 
          message: paymentResult.message,
          transactionId: transaction.transactionId
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error procesando el checkout' }
    });
  }
};

// GET /api/payments/methods
export const getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const paymentMethods = getUserPaymentMethods(userId);

    res.json({
      success: true,
      data: { paymentMethods }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo métodos de pago' }
    });
  }
};

// GET /api/payments/transactions
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { limit = 20 } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const transactions = getUserTransactions(userId, Number(limit));

    res.json({
      success: true,
      data: { 
        transactions,
        total: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo transacciones' }
    });
  }
};

// GET /api/payments/transactions/:id
export const getTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const transaction = getTransactionById(id);
    
    if (!transaction || transaction.userId !== userId) {
      res.status(404).json({
        success: false,
        error: { message: 'Transacción no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo transacción' }
    });
  }
};

// POST /api/payments/transactions/:id/refund
export const refundTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const transaction = getTransactionById(id);
    
    if (!transaction || transaction.userId !== userId) {
      res.status(404).json({
        success: false,
        error: { message: 'Transacción no encontrada' }
      });
      return;
    }

    if (transaction.status !== 'completed') {
      res.status(400).json({
        success: false,
        error: { message: 'Solo se pueden reembolsar transacciones completadas' }
      });
      return;
    }

    // Simular procesamiento de reembolso
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateTransactionStatus(transaction.transactionId, 'refunded');

    // Crear notificación de reembolso
    createNotification({
      userId,
      type: 'system',
      title: 'Reembolso procesado',
      message: `Tu reembolso de $${transaction.amount} ${transaction.currency} ha sido procesado.`,
      isRead: false,
      priority: 'medium',
      data: {
        transactionId: transaction.transactionId,
        amount: transaction.amount
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Reembolso procesado exitosamente',
        transaction: {
          ...transaction,
          status: 'refunded'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error procesando reembolso' }
    });
  }
};
