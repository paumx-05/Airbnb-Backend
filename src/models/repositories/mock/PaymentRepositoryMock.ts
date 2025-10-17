/**
 * 🎯 REPOSITORY MOCK DE PAGOS
 */

import { IPaymentRepository } from '../../interfaces/IPaymentRepository';
import { PaymentMethod, Transaction, CheckoutData } from '../../../types/payments';

export class PaymentRepositoryMock implements IPaymentRepository {
  private paymentDB = {
    paymentMethods: [] as PaymentMethod[],
    transactions: [] as Transaction[],
    nextId: 1
  };

  async addPaymentMethod(userId: string, paymentData: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod> {
    const newMethod: PaymentMethod = {
      ...paymentData,
      id: this.paymentDB.nextId.toString(),
      createdAt: new Date().toISOString()
    };
    this.paymentDB.paymentMethods.push(newMethod);
    this.paymentDB.nextId++;
    return newMethod;
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return this.paymentDB.paymentMethods.filter(method => method.userId === userId);
  }

  async deletePaymentMethod(userId: string, methodId: string): Promise<boolean> {
    const methodIndex = this.paymentDB.paymentMethods.findIndex(method => 
      method.id === methodId && method.userId === userId
    );
    if (methodIndex === -1) return false;
    
    this.paymentDB.paymentMethods.splice(methodIndex, 1);
    return true;
  }

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transactionData,
      id: this.paymentDB.nextId.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.paymentDB.transactions.push(newTransaction);
    this.paymentDB.nextId++;
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return this.paymentDB.transactions
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    return this.paymentDB.transactions.find(transaction => transaction.id === id) || null;
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | null> {
    const transactionIndex = this.paymentDB.transactions.findIndex(transaction => transaction.id === id);
    if (transactionIndex === -1) return null;
    
    this.paymentDB.transactions[transactionIndex] = {
      ...this.paymentDB.transactions[transactionIndex],
      status: status as any,
      updatedAt: new Date().toISOString()
    };
    return this.paymentDB.transactions[transactionIndex];
  }

  async calculatePricing(propertyId: string, checkIn: string, checkOut: string, guests: number): Promise<{
    nights: number;
    basePrice: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency: string;
  }> {
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = 100;
    const subtotal = basePrice * nights;
    const cleaningFee = 25;
    const serviceFee = subtotal * 0.1;
    const taxes = (subtotal + cleaningFee + serviceFee) * 0.1;
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      nights,
      basePrice,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total,
      currency: 'USD'
    };
  }

  async validatePaymentData(paymentData: any): Promise<boolean> {
    return paymentData && paymentData.amount > 0;
  }

  async processPayment(checkoutData: CheckoutData): Promise<Transaction> {
    // Simular datos de transacción basados en CheckoutData
    const amount = 150; // Precio simulado
    const paymentMethod: PaymentMethod = {
      id: '1',
      userId: 'user123', // Simulado
      type: 'credit_card',
      cardNumber: checkoutData.paymentInfo.cardNumber,
      cardBrand: 'visa',
      expiryMonth: checkoutData.paymentInfo.expiryMonth,
      expiryYear: checkoutData.paymentInfo.expiryYear,
      cardholderName: checkoutData.paymentInfo.cardholderName,
      isDefault: true,
      createdAt: new Date().toISOString()
    };

    return await this.createTransaction({
      userId: 'user123', // Simulado
      propertyId: checkoutData.propertyId,
      reservationId: 'reservation123', // Simulado
      amount: amount,
      currency: 'USD',
      status: 'completed',
      paymentMethod: paymentMethod,
      transactionId: `txn_${Date.now()}`,
      description: `Pago para propiedad ${checkoutData.propertyId}`
    });
  }

  getCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  }
}
