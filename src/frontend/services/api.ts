// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Simple token storage (in-memory fallback)
const TOKEN_KEY = 'jobfair_token';
function setToken(token: string | null) {
  try { localStorage.setItem(TOKEN_KEY, token || ''); } catch {}
}
function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
}

// API Service
export const api = {
  // Login
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    const data = await response.json();
    if (data.token) setToken(data.token);
    return data;
  },

  // Logout
  async logout() {
    const response = await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Logout failed');
    return response.json();
  },

  // Get current user (uses token if available)
  async getCurrentUser() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/me/`, {
      credentials: token ? 'omit' : 'include',
      headers,
    });
    
    if (!response.ok) {
      // Si le token est invalide (401 ou 403), on le supprime et on recharge la page
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.reload(); // Cela déclenchera la redirection vers /login via ProtectedRoute
        return null;
      }
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  // Update current user / student (partial)
  async updateCurrentUser(payload: Record<string, any>) {
    const token = getToken();
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/me/`, {
      method: 'PATCH',
      credentials: token ? 'omit' : 'include',
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.reload();
        return null;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update user');
    }
    return response.json();
  },

  // Get next company to swipe
  async getNextCompany() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/companies/next_card/`, {
      credentials: token ? 'omit' : 'include',
      headers,
    });
    if (response.status === 204) return null; // No more companies
    if (!response.ok) throw new Error('Failed to fetch company');
    return response.json();
  },

  // Create a swipe
  async createSwipe(companyId: number, direction: 'left' | 'right') {
    const token = getToken();
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/swipes/`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      credentials: token ? 'omit' : 'include',
      body: JSON.stringify({
        company_id: companyId,
        direction: direction,
      }),
    });
    if (!response.ok) throw new Error('Failed to create swipe');
    return response.json();
  },

  // Get all matches
  async getMatches() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/matches/`, {
      credentials: token ? 'omit' : 'include',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch matches');
    return response.json();
  },

  // Get all interviews
  async getInterviews() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/interviews/`, {
      credentials: token ? 'omit' : 'include',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch interviews');
    return response.json();
  },

  // Upload CV (fichier PDF ou Word)
  async uploadCV(file: File) {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    
    const formData = new FormData();
    formData.append('cv', file);
    
    const response = await fetch(`${API_BASE_URL}/cv/`, {
      method: 'POST',
      credentials: token ? 'omit' : 'include',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload CV');
    }
    return response.json();
  },

  // Supprimer CV
  async deleteCV() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    
    const response = await fetch(`${API_BASE_URL}/cv/`, {
      method: 'DELETE',
      credentials: token ? 'omit' : 'include',
      headers,
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete CV');
    }
    return response.json();
  },

  getToken,
  setToken,
};

export default api;
