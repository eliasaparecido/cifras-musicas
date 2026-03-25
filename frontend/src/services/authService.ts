import api from "../lib/api";

const TOKEN_KEY = "cm_auth_token";
const USER_KEY = "cm_auth_user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

interface MessageResponse {
  message: string;
}

function persistAuth(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  window.dispatchEvent(new Event("auth-changed"));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    persistAuth(response.data);
    return response.data.user;
  },

  async register(name: string, email: string, password: string): Promise<AuthUser> {
    const response = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    persistAuth(response.data);
    return response.data.user;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore network/logout errors and clear local state anyway
    }
    clearAuth();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.post<AuthResponse>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    persistAuth(response.data);
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await api.post<MessageResponse>("/auth/forgot-password", { email });
    return response.data.message;
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const response = await api.post<MessageResponse>("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data.message;
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  getCurrentUser(): AuthUser | null {
    const serialized = localStorage.getItem(USER_KEY);
    if (!serialized) {
      return null;
    }

    try {
      return JSON.parse(serialized) as AuthUser;
    } catch {
      return null;
    }
  },

  clearLocalAuth(): void {
    clearAuth();
  },
};
