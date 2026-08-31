
export interface MonthlyRevenueResponse {
  totalRevenue: number;
}

export interface MonthlyOrderCount {
  month: string;
  count: number;
}

export interface PaymentDistribution {
  method: string;
  count: number;
  total: number;
}
