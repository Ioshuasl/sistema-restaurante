
import api from './api';
import { type MonthlyRevenueResponse, type MonthlyOrderCount, type PaymentDistribution  } from '../types/interfaces-types';

export const getTotalOrders = async (): Promise<number> => {
    const response = await api.get('/pedido/total');
    return response.data;
};

export const getMonthlyRevenue = async (): Promise<MonthlyRevenueResponse> => {
  const response = await api.get('/dashboard/revenue');
  return response.data;
};

export const getMonthlyOrderCounts = async (): Promise<MonthlyOrderCount[]> => {
  const response = await api.get('/dashboard/orders');
  return response.data;
};

export const getPaymentMethodDistribution = async (): Promise<PaymentDistribution[]> => {
  const response = await api.get('/dashboard/payments');
  return response.data;
};
