import Realm from 'realm';

import { financeSchemas } from './schema/financeSchemas';
import { plannerSchemas } from './schema/plannerSchemas';
import { SeedService } from '@/services/SeedService';

const schemaVersion = 8;

const ensureField = <T>(collection: Realm.Results<T>, field: keyof T, value: any) => {
  collection.forEach((item: any) => {
    if (item[field] === undefined || item[field] === null) {
      item[field] = typeof value === 'function' ? value(item) : value;
    }
  });
};

export const realmConfig: Realm.Configuration = {
  schema: [...financeSchemas, ...plannerSchemas],
  schemaVersion,
  onMigration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion >= schemaVersion) {
      return;
    }

    const accounts = newRealm.objects<any>('Account');
    ensureField(accounts, 'userId', 'local-user');
    ensureField(accounts, 'syncStatus', 'local');
    ensureField(accounts, 'customTypeId', null);

    const transactions = newRealm.objects<any>('Transaction');
    transactions.forEach((txn) => {
      if (!txn.userId) txn.userId = 'local-user';
      if (!txn.baseCurrency) txn.baseCurrency = txn.currency;
      if (!txn.rateUsedToBase) txn.rateUsedToBase = 1;
      if (!txn.convertedAmountToBase) txn.convertedAmountToBase = txn.amount;
      if (!txn.syncStatus) txn.syncStatus = 'local';
    });

    const budgets = newRealm.objects<any>('Budget');
    ensureField(budgets, 'userId', 'local-user');
    ensureField(budgets, 'syncStatus', 'local');
    ensureField(budgets, 'accountId', null);
    ensureField(budgets, 'transactionType', 'expense');
    ensureField(budgets, 'notifyOnExceed', false);

    const budgetEntries = newRealm.objects<any>('BudgetEntry');
    ensureField(budgetEntries, 'syncStatus', 'local');

    const debts = newRealm.objects<any>('Debt');
    ensureField(debts, 'userId', 'local-user');
    ensureField(debts, 'syncStatus', 'local');
    ensureField(debts, 'counterpartyId', null);
    ensureField(debts, 'principalOriginalAmount', (item: any) => item.principalAmount ?? 0);
    ensureField(debts, 'principalOriginalCurrency', (item: any) => item.principalCurrency);
    ensureField(debts, 'fundingAccountId', null);
    ensureField(debts, 'fundingTransactionId', null);
    ensureField(debts, 'reminderEnabled', false);
    ensureField(debts, 'reminderTime', null);
    debts.forEach((debt: any) => {
      debt.payments?.forEach((payment: any) => {
        if (payment.accountId === undefined) payment.accountId = null;
        if (payment.note === undefined) payment.note = null;
      });
    });

    const fxRates = newRealm.objects<any>('FxRate');
    ensureField(fxRates, 'syncStatus', 'local');
  },
  onFirstOpen: (realm) => {
    const seeder = new SeedService(realm);
    seeder.seedDemoAccounts();
  },
};
