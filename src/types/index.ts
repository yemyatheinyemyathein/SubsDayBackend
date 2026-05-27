export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  baseCurrency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISharedMember {
  user?: string;
  email: string;
  status: 'pending' | 'active';
  shareAmount: number;
  joinedAt?: Date;
}

export interface ISubscription {
  _id?: string;
  user: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'custom';
  nextBillingDate: Date;
  startDate?: Date;
  endDate?: Date;
  category: string;
  status: 'active' | 'canceled';
  logo?: string;
  notes?: string;
  isShared: boolean;
  sharedMembers?: ISharedMember[];
  splitType: 'equal' | 'custom';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStats {
  monthlySpending: number;
  yearlyProjection: number;
  dailyProjection: number;
  categoryBreakdown: { category: string; total: number; count: number }[];
  upcomingPayments: { name: string; price: number; currency: string; date: Date }[];
  totalActive: number;
}
