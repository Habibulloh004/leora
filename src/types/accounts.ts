export type AccountKind = 'cash' | 'card' | 'savings' | 'usd' | 'crypto' | 'other';

export type AccountTransactionType = 'income' | 'outcome';

export interface AccountTransaction {
  id: string;
  type: AccountTransactionType;
  amount: number;
  time: string;
  description?: string;
}

export interface AccountItem {
  id: string;
  name: string;
  type: AccountKind;
  balance: number;
  currency: string;
  subtitle: string;
  iconColor: string;
  progress?: number;
  goal?: number;
  usdRate?: number;
  transactions: AccountTransaction[];
  isArchived?: boolean;
}

export interface AddAccountPayload {
  name: string;
  description: string;
  amount: number;
  type: AccountKind;
}
