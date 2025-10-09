import { Account } from '@/utils/models';
import { Rate } from '@/utils/models/Rate';
import Realm from 'realm';
import { AccountService } from './AccountService';

export class SeedService {
  private realm: Realm;
  private accountService: AccountService;

  constructor(realm: Realm) {
    this.realm = realm;
    this.accountService = new AccountService(realm);
  }

  hasData(): boolean {
    return this.realm.objects<Account>('Account').length > 0;
  }

  seedDemoAccounts(): void {
    if (this.hasData()) {
      console.log('Data already exists, skipping seed');
      return;
    }

    console.log('Seeding demo accounts...');

    const demoAccounts = [
      {
        name: 'Наличные',
        type: 'cash' as const,
        currency: 'UZS',
        balance: 450000,
        isPrimary: true,
      },
      {
        name: 'Humo Card',
        type: 'card' as const,
        currency: 'UZS',
        balance: 1250000,
        isPrimary: false,
      },
      {
        name: 'USD Wallet',
        type: 'cash' as const,
        currency: 'USD',
        balance: 120.50,
        isPrimary: true,
      },
    ];

    demoAccounts.forEach(account => {
      this.accountService.createAccount(account);
    });

    this.seedRates();
    console.log('Demo data seeded successfully');
  }

  seedRates(): void {
    const rates = [
      { currency: 'USD', rateToUSD: 1, source: 'manual' as const },
      { currency: 'UZS', rateToUSD: 0.000079, source: 'manual' as const },
      { currency: 'EUR', rateToUSD: 1.08, source: 'manual' as const },
    ];

    this.realm.write(() => {
      rates.forEach(rate => {
        this.realm.create<Rate>('Rate', {
          ...rate,
          effectiveFrom: new Date(),
        });
      });
    });
  }

  clearAllData(): void {
    this.realm.write(() => {
      this.realm.deleteAll();
    });
    console.log('All data cleared');
  }
}