// Simulating a Spring Boot REST API backend

export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'unsubscribed';
  addedAt: string;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledFor?: string;
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
  recipient?: string;
  content?: string;
}

// Mock Database
let contacts: Contact[] = [
  { id: '1', email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith', status: 'active', addedAt: '2023-10-01T10:00:00Z' },
  { id: '2', email: 'bob@example.com', firstName: 'Bob', lastName: 'Jones', status: 'active', addedAt: '2023-10-05T14:30:00Z' },
  { id: '3', email: 'charlie@example.com', firstName: 'Charlie', lastName: 'Brown', status: 'unsubscribed', addedAt: '2023-10-10T09:15:00Z' },
];

const today = new Date();
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
};

let campaigns: EmailCampaign[] = [
  { id: 'c1', subject: 'Welcome to our platform', status: 'sent', sentAt: addDays(today, -10), openRate: 45.2, clickRate: 12.5 },
  { id: 'c2', subject: 'Monthly Newsletter', status: 'sent', sentAt: addDays(today, -5), openRate: 38.7, clickRate: 9.2 },
  { id: 'c3', subject: 'Product Update Q4', status: 'scheduled', scheduledFor: addDays(today, 2) },
  { id: 'c5', subject: 'Webinar Invitation', status: 'scheduled', scheduledFor: addDays(today, 5) },
  { id: 'c4', subject: 'Black Friday Early Access', status: 'draft' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  auth: {
    login: async (email: string, password: string):Promise<User> => {
      await delay(800);
      if (email && password) {
        return { id: 'u1', email, name: 'Admin User', token: 'mock-jwt-token-123' };
      }
      throw new Error('Invalid credentials');
    },
    register: async (email: string, password: string, name: string):Promise<User> => {
      await delay(800);
      return { id: 'u2', email, name, token: 'mock-jwt-token-456' };
    }
  },
  contacts: {
    getAll: async (): Promise<Contact[]> => {
      await delay(500);
      return [...contacts];
    },
    add: async (contact: Omit<Contact, 'id' | 'addedAt'>): Promise<Contact> => {
      await delay(600);
      const newContact = {
        ...contact,
        id: Math.random().toString(36).substring(7),
        addedAt: new Date().toISOString()
      };
      contacts.push(newContact);
      return newContact;
    },
    bulkAdd: async (newContacts: Omit<Contact, 'id' | 'addedAt'>[]): Promise<Contact[]> => {
      await delay(800);
      const addedContacts = newContacts.map(contact => ({
        ...contact,
        id: Math.random().toString(36).substring(7),
        addedAt: new Date().toISOString()
      }));
      contacts.push(...addedContacts);
      return addedContacts;
    },
    delete: async (id: string): Promise<void> => {
      await delay(400);
      contacts = contacts.filter(c => c.id !== id);
    }
  },
  campaigns: {
    getAll: async (): Promise<EmailCampaign[]> => {
      await delay(500);
      return [...campaigns];
    },
    add: async (campaign: Omit<EmailCampaign, 'id'>): Promise<EmailCampaign> => {
      await delay(600);
      const newCampaign = {
        ...campaign,
        id: Math.random().toString(36).substring(7),
      };
      campaigns.push(newCampaign);
      return newCampaign;
    },
    updateStatus: async (id: string, status: EmailCampaign['status']): Promise<EmailCampaign> => {
      await delay(400);
      const campaign = campaigns.find(c => c.id === id);
      if (!campaign) throw new Error('Campaign not found');
      campaign.status = status;
      if (status === 'sent') {
        campaign.sentAt = new Date().toISOString();
      }
      return { ...campaign };
    },
    bulkDelete: async (ids: string[]): Promise<void> => {
      await delay(600);
      campaigns = campaigns.filter(c => !ids.includes(c.id));
    },
    bulkUpdateStatus: async (ids: string[], status: EmailCampaign['status']): Promise<void> => {
      await delay(600);
      campaigns = campaigns.map(c => {
        if (ids.includes(c.id)) {
          return {
            ...c,
            status,
            ...(status === 'sent' ? { sentAt: new Date().toISOString() } : {})
          };
        }
        return c;
      });
    }
  },
  stats: {
    getOverview: async () => {
      await delay(600);
      return {
        totalSubscribers: contacts.filter(c => c.status === 'active').length,
        emailsSentThisMonth: 12450,
        avgOpenRate: 41.5,
        avgClickRate: 10.8,
        deliveryRate: 99.2
      };
    },
    getChartData: async () => {
      await delay(400);
      return [
        { name: 'Mon', sent: 400, opened: 240 },
        { name: 'Tue', sent: 300, opened: 139 },
        { name: 'Wed', sent: 200, opened: 980 },
        { name: 'Thu', sent: 278, opened: 390 },
        { name: 'Fri', sent: 189, opened: 480 },
        { name: 'Sat', sent: 239, opened: 380 },
        { name: 'Sun', sent: 349, opened: 430 },
      ];
    }
  }
};
