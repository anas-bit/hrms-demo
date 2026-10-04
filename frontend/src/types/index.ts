export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    avatar?: string;
    permissions: string[];
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string) => Promise<void>;
    logout: () => void;
}

export interface Module {
    id: string;
    name: string;
    icon: string;
    path: string;
    description: string;
}
