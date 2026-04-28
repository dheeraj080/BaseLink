import api from '@/lib/api';
import { Contact, BulkSelectionRequest, ContactGroup, EmailRequest } from '@/types/api';

export const contactService = {
  getContacts: async (onlySelected: boolean = false): Promise<Contact[]> => {
    const response = await api.get<Contact[]>(`/contacts?onlySelected=${onlySelected}`);
    return response.data;
  },
  createContact: async (contact: Contact): Promise<Contact> => {
    const response = await api.post<Contact>('/contacts', contact);
    return response.data;
  },
  updateContact: async (id: string, contact: Contact): Promise<Contact> => {
    const response = await api.put<Contact>(`/contacts/${id}`, contact);
    return response.data;
  },
  deleteContact: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },
  toggleSelection: async (id: string, selected: boolean): Promise<void> => {
    await api.patch(`/contacts/${id}/selection?selected=${selected}`);
  },
  bulkSelect: async (data: BulkSelectionRequest): Promise<void> => {
    await api.post('/contacts/bulk-selection', data);
  },
  createMultiple: async (contacts: Contact[]): Promise<Contact[]> => {
    const response = await api.post<Contact[]>('/contacts/bulk', contacts);
    return response.data;
  },
  uploadCsv: async (file: File): Promise<Contact[]> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<Contact[]>('/contacts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  exportCsv: async (): Promise<Blob> => {
    const response = await api.get('/contacts/export', { responseType: 'blob' });
    return response.data;
  },
  broadcast: async (request: EmailRequest): Promise<string> => {
    const response = await api.post<string>('/contacts/broadcast', request);
    return response.data;
  },
};

export const groupService = {
  list: async (): Promise<ContactGroup[]> => {
    const response = await api.get<ContactGroup[]>('/groups');
    return response.data;
  },
  create: async (group: ContactGroup): Promise<ContactGroup> => {
    const response = await api.post<ContactGroup>('/groups', group);
    return response.data;
  },
  update: async (id: string, group: ContactGroup): Promise<ContactGroup> => {
    const response = await api.put<ContactGroup>(`/groups/${id}`, group);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}`);
  },
  addSelected: async (groupId: string): Promise<string> => {
    const response = await api.post<string>(`/groups/${groupId}/add-selected`);
    return response.data;
  },
};
