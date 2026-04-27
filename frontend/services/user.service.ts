import api from '@/lib/api';
import { UserDTO } from '@/types/api';

export const userService = {
  getAllUsers: async (): Promise<object> => {
    const response = await api.get<object>('/users');
    return response.data;
  },
  getUserById: async (id: string): Promise<UserDTO> => {
    const response = await api.get<UserDTO>(`/users/${id}`);
    return response.data;
  },
  getUserByEmail: async (email: string): Promise<UserDTO> => {
    const response = await api.get<UserDTO>(`/users/email/${email}`);
    return response.data;
  },
  updateUser: async (id: string, user: UserDTO): Promise<UserDTO> => {
    const response = await api.put<UserDTO>(`/users/${id}`, user);
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
