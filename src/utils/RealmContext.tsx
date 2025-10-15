import { SeedService } from '@/services/SeedService';
import { createRealmContext } from '@realm/react';
import Realm from 'realm';
import { Account } from './models/Account';
import { Budget } from './models/Budget';
import { Debt, DebtPayment } from './models/Debt';
import { Rate } from './models/Rate';
import { RecurringTransaction } from './models/RecurringTransaction';
import { Transaction } from './models/Transaction';

// Конфигурация Realm с миграцией
const realmConfig: Realm.Configuration = {
  schema: [
    Account, 
    Transaction, 
    Rate, 
    Budget, 
    Debt, 
    DebtPayment,
    RecurringTransaction, // ДОБАВЛЕНО
  ],
  schemaVersion: 3, // Увеличиваем версию для новой модели

  // Миграция для добавления новых моделей и полей
  onMigration: (oldRealm: Realm, newRealm: Realm) => {
    // Версия 1 -> 2: Добавление Debt модели
    if (oldRealm.schemaVersion < 2) {
      console.log('Migrating from version', oldRealm.schemaVersion, 'to', 2);
      // Debt модель добавится автоматически
    }
    
    // Версия 2 -> 3: Добавление RecurringTransaction и полей в Transaction
    if (oldRealm.schemaVersion < 3) {
      console.log('Migrating to version 3: Adding RecurringTransaction');
      
      // Обновляем существующие транзакции с новыми полями
      const oldTransactions = oldRealm.objects('Transaction');
      const newTransactions = newRealm.objects('Transaction');
      
      for (let i = 0; i < oldTransactions.length; i++) {
        // @ts-ignore
        newTransactions[i].isRecurring = false;
        // recurringId остается undefined
      }
    }
  },
  
  onFirstOpen: (realm) => {
    console.log('Realm opened for the first time');
    const seedService = new SeedService(realm);
    seedService.seedDemoAccounts();
  },
};

// Создаем контекст
export const RealmContext = createRealmContext(realmConfig);

// Экспортируем хуки для использования
export const { 
  RealmProvider, 
  useRealm, 
  useObject, 
  useQuery 
} = RealmContext;
