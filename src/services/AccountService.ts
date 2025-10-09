import { Account } from '@/utils/models';
import Realm, { BSON } from 'realm';

export class AccountService {
  private realm: Realm;

  constructor(realm: Realm) {
    this.realm = realm;
  }

  // Создание счета
  createAccount(data: {
    name: string;
    currency: string;
    type: Account['type'];
    balance?: number;
    isPrimary?: boolean;
  }): Account {
    let account: Account;
    
    this.realm.write(() => {
      // Если isPrimary true, сбрасываем у других счетов той же валюты
      if (data.isPrimary) {
        const existingPrimary = this.realm
          .objects<Account>('Account')
          .filtered('currency = $0 AND isPrimary = true', data.currency);
        
        existingPrimary.forEach(acc => {
          acc.isPrimary = false;
        });
      }

      account = this.realm.create<Account>('Account', {
        ...data,
        balance: data.balance || 0,
        isPrimary: data.isPrimary || false,
        isArchived: false,
        syncStatus: 'local',
      });
    });

    return account!;
  }

  // Получение всех активных счетов
  getActiveAccounts(): Realm.Results<Account> {
    return this.realm
      .objects<Account>('Account')
      .filtered('isArchived = false')
      .sorted('name');
  }

  // Получение счета по ID
  getAccountById(id: BSON.ObjectId): Account | null {
    return this.realm.objectForPrimaryKey<Account>('Account', id);
  }

  // Обновление баланса
  updateBalance(accountId: BSON.ObjectId, newBalance: number): void {
    this.realm.write(() => {
      const account = this.getAccountById(accountId);
      if (account) {
        account.balance = newBalance;
        account.updatedAt = new Date();
        account.syncStatus = 'pending';
      }
    });
  }

  // Архивирование счета
  archiveAccount(accountId: BSON.ObjectId): void {
    this.realm.write(() => {
      const account = this.getAccountById(accountId);
      if (account) {
        account.isArchived = true;
        account.updatedAt = new Date();
        account.syncStatus = 'pending';
      }
    });
  }
}