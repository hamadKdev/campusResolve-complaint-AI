import { apiClient, tokenStorage } from './apiClient';
import { UserProfile } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  user?: UserProfile;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/auth/login', payload, false);
    if (data.access_token) {
      tokenStorage.set(data.access_token);
    }
    return data;
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/auth/signup', payload, false);
    if (data.access_token) {
      tokenStorage.set(data.access_token);
    }
    return data;
  },

  getMe: async (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>('/auth/me', true);
  },

  logout: (): void => {
    tokenStorage.remove();
  },
};
