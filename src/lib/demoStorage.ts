const DEMO_USER_KEY = 'money-moves-demo-user';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export function getDemoUser(): DemoUser {
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const demoUser: DemoUser = {
    id: generateId(),
    email: 'demo@local.app',
    name: 'Demo User',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
  return demoUser;
}

function getDemoStorageKey(table: string) {
  return `money-moves-demo-${table}-${getDemoUser().id}`;
}

export function getDemoData<T>(table: string): T[] {
  const stored = localStorage.getItem(getDemoStorageKey(table));
  return stored ? JSON.parse(stored) : [];
}

export function setDemoData<T>(table: string, data: T[]) {
  localStorage.setItem(getDemoStorageKey(table), JSON.stringify(data));
}

export function addDemoItem<T extends Record<string, any>>(table: string, item: T): T {
  const data = getDemoData<T>(table);
  const now = new Date().toISOString();
  const newItem = {
    ...item,
    id: item.id || generateId(),
    created_at: item.created_at || now,
    updated_at: item.updated_at || now,
  };
  data.unshift(newItem);
  setDemoData(table, data);
  return newItem;
}

export function updateDemoItem<T extends Record<string, any>>(table: string, id: string, updates: Partial<T>): T | null {
  const data = getDemoData<T>(table);
  const index = data.findIndex((item: any) => item.id === id);
  if (index === -1) return null;
  data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
  setDemoData(table, data);
  return data[index];
}

export function deleteDemoItem(table: string, id: string): boolean {
  const data = getDemoData(table);
  const filtered = data.filter((item: any) => item.id !== id);
  if (filtered.length === data.length) return false;
  setDemoData(table, filtered);
  return true;
}

export function clearDemoData() {
  const user = getDemoUser();
  const tables = ['expenses', 'transactions', 'watchlist', 'profiles', 'subscribers'];
  tables.forEach(table => {
    localStorage.removeItem(`money-moves-demo-${table}-${user.id}`);
  });
  localStorage.removeItem(DEMO_USER_KEY);
}
