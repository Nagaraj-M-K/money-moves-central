
// Simple database abstraction layer using localStorage
// This can be easily replaced with a real database implementation

export interface DatabaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserData extends DatabaseRecord {
  email: string;
  name: string;
  subscription?: any;
  preferences: any;
}

export interface TransactionData extends DatabaseRecord {
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface ExpenseData extends DatabaseRecord {
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface PortfolioData extends DatabaseRecord {
  userId: string;
  stocks: any[];
  totalValue: number;
  lastUpdated: string;
}

class LocalStorageDB {
  private getKey(table: string): string {
    return `db_${table}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async create<T extends DatabaseRecord>(table: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const records = this.getAll<T>(table);
    const newRecord = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;

    records.push(newRecord);
    localStorage.setItem(this.getKey(table), JSON.stringify(records));
    return newRecord;
  }

  async findById<T extends DatabaseRecord>(table: string, id: string): Promise<T | null> {
    const records = this.getAll<T>(table);
    return records.find(record => record.id === id) || null;
  }

  async findBy<T extends DatabaseRecord>(table: string, query: Partial<T>): Promise<T[]> {
    const records = this.getAll<T>(table);
    return records.filter(record => {
      return Object.entries(query).every(([key, value]) => 
        record[key as keyof T] === value
      );
    });
  }

  getAll<T extends DatabaseRecord>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getKey(table));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${table}:`, error);
      return [];
    }
  }

  async update<T extends DatabaseRecord>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
    const records = this.getAll<T>(table);
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) return null;

    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.getKey(table), JSON.stringify(records));
    return records[index];
  }

  async delete(table: string, id: string): Promise<boolean> {
    const records = this.getAll(table);
    const filteredRecords = records.filter(record => record.id !== id);
    
    if (filteredRecords.length === records.length) return false;
    
    localStorage.setItem(this.getKey(table), JSON.stringify(filteredRecords));
    return true;
  }

  async clear(table: string): Promise<void> {
    localStorage.removeItem(this.getKey(table));
  }

  // Backup and restore functionality
  async backup(): Promise<string> {
    const allData: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('db_')) {
        allData[key] = JSON.parse(localStorage.getItem(key) || '[]');
      }
    }
    
    return JSON.stringify(allData);
  }

  async restore(backupData: string): Promise<void> {
    try {
      const data = JSON.parse(backupData);
      
      // Clear existing database
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('db_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Restore data
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    } catch (error) {
      throw new Error('Invalid backup data');
    }
  }
}

// Export singleton instance
export const db = new LocalStorageDB();

// Convenience functions for specific tables
export const usersTable = {
  create: (data: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>) => 
    db.create<UserData>('users', data),
  findById: (id: string) => db.findById<UserData>('users', id),
  findByEmail: async (email: string) => {
    const users = await db.findBy<UserData>('users', { email });
    return users[0] || null;
  },
  update: (id: string, updates: Partial<UserData>) => 
    db.update<UserData>('users', id, updates),
  delete: (id: string) => db.delete('users', id),
};

export const transactionsTable = {
  create: (data: Omit<TransactionData, 'id' | 'createdAt' | 'updatedAt'>) => 
    db.create<TransactionData>('transactions', data),
  findByUserId: (userId: string) => 
    db.findBy<TransactionData>('transactions', { userId }),
  update: (id: string, updates: Partial<TransactionData>) => 
    db.update<TransactionData>('transactions', id, updates),
  delete: (id: string) => db.delete('transactions', id),
};

export const expensesTable = {
  create: (data: Omit<ExpenseData, 'id' | 'createdAt' | 'updatedAt'>) => 
    db.create<ExpenseData>('expenses', data),
  findByUserId: (userId: string) => 
    db.findBy<ExpenseData>('expenses', { userId }),
  update: (id: string, updates: Partial<ExpenseData>) => 
    db.update<ExpenseData>('expenses', id, updates),
  delete: (id: string) => db.delete('expenses', id),
};

export const portfolioTable = {
  create: (data: Omit<PortfolioData, 'id' | 'createdAt' | 'updatedAt'>) => 
    db.create<PortfolioData>('portfolio', data),
  findByUserId: async (userId: string) => {
    const portfolios = await db.findBy<PortfolioData>('portfolio', { userId });
    return portfolios[0] || null;
  },
  update: (id: string, updates: Partial<PortfolioData>) => 
    db.update<PortfolioData>('portfolio', id, updates),
  delete: (id: string) => db.delete('portfolio', id),
};
