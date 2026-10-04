import { create } from 'zustand';
import type { AuthState, User } from '../types';

// Mock user for MVP
const MOCK_USER: User = {
    id: 'u-1',
    name: 'Demo Admin',
    email: 'admin@nexus.com',
    role: 'admin',
    permissions: ['all'],
    avatar: 'https://ui-avatars.com/api/?name=Demo+Admin&background=0D8ABC&color=fff'
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: async (email: string) => {
        set({ isLoading: true });
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For MVP, just log them in as the mock user
        set({
            user: { ...MOCK_USER, email },
            isAuthenticated: true,
            isLoading: false
        });
    },
    logout: () => {
        set({ user: null, isAuthenticated: false });
    }
}));
