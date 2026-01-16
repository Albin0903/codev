// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Token storage
const TOKEN_KEY = 'jobfair_token';
const USER_TYPE_KEY = 'jobfair_user_type';

function setToken(token: string | null) {
  try { sessionStorage.setItem(TOKEN_KEY, token || ''); } catch {}
}
function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
}
function setUserType(userType: 'student' | 'company' | null) {
  try { sessionStorage.setItem(USER_TYPE_KEY, userType || ''); } catch {}
}
function getUserType(): 'student' | 'company' | null {
  try { 
    const type = sessionStorage.getItem(USER_TYPE_KEY);
    return type === 'student' || type === 'company' ? type : null;
  } catch { 
    return null; 
  }
}
function clearAuth() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_TYPE_KEY);
  } catch {}
}

// API Service
export const api = {
  // --- NOUVELLE MÉTHODE AJOUTÉE ICI (DANS L'OBJET) ---
  async register(userData: { username: string, email: string, password: string, userType: 'student' | 'company' }) {
    const payload = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      user_type: userData.userType 
    };

    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit', 
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      let errorMsg = 'Erreur lors de l\'inscription.';

      if (error.username) {
        errorMsg = `Nom d'utilisateur : ${error.username[0]}`;
      } else if (error.email) {
        errorMsg = `Email : ${error.email[0]}`;
      } else if (error.non_field_errors) {
        errorMsg = error.non_field_errors[0];
      } else if (error.detail) {
        errorMsg = error.detail;
      }
      
      throw new Error(errorMsg);
    }
    
    return response.json();
  },

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
    if (data.user_type) setUserType(data.user_type);
    return data;
  },

  // Logout
  async logout() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    
    const response = await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      credentials: token ? 'omit' : 'include',
      headers,
    });
    
    clearAuth();
    
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
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        window.location.reload();
        return null;
      }
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  // Get current company
  async getCurrentCompany() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/company/me/`, {
      credentials: token ? 'omit' : 'include',
      headers,
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        window.location.reload();
        return null;
      }
      throw new Error('Failed to fetch company');
    }
    return response.json();
  },

  // Update current company
  async updateCurrentCompany(payload: Record<string, any>) {
    const token = getToken();
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/company/me/`, {
      method: 'PATCH',
      credentials: token ? 'omit' : 'include',
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        window.location.reload();
        return null;
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update company');
    }
    return response.json();
  },

  // Get offers for current company
  async getCompanyOffers() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/company/offers/`, {
      credentials: token ? 'omit' : 'include',
      headers,
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        window.location.reload();
        return [];
      }
      throw new Error('Failed to fetch offers');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
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
        clearAuth();
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

  // Get company interviews
  async getCompanyInterviews() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/company/interviews/`, {
      credentials: token ? 'omit' : 'include',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch company interviews');
    return response.json();
  },

  // Get company matches
  async getCompanyMatches() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    const response = await fetch(`${API_BASE_URL}/company/matches/`, {
      credentials: token ? 'omit' : 'include',
      headers,
    });
    if (!response.ok) throw new Error('Failed to fetch company matches');
    return response.json();
  },

  // Upload CV
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

  // Upload Photo
  async uploadPhoto(file: File) {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch(`${API_BASE_URL}/photo/`, {
      method: 'POST',
      credentials: token ? 'omit' : 'include',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload photo');
    }
    return response.json();
  },

  // Supprimer Photo
  async deletePhoto() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;
    
    const response = await fetch(`${API_BASE_URL}/photo/`, {
      method: 'DELETE',
      credentials: token ? 'omit' : 'include',
      headers,
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete photo');
    }
    return response.json();
  },

  // Upload company logo
  async uploadCompanyLogo(file: File) {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;

    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${API_BASE_URL}/company/logo/`, {
      method: 'POST',
      credentials: token ? 'omit' : 'include',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload logo');
    }
    return response.json();
  },

  // Delete company logo
  async deleteCompanyLogo() {
    const token = getToken();
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Token ${token}`;

    const response = await fetch(`${API_BASE_URL}/company/logo/`, {
      method: 'DELETE',
      credentials: token ? 'omit' : 'include',
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete logo');
    }
    return response.json();
  },

  // Basculer la visibilité de la photo
  async togglePhotoVisibility() {
    const token = getToken();
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Token ${token}`;
    
    const response = await fetch(`${API_BASE_URL}/photo/`, {
      method: 'PATCH',
      credentials: token ? 'omit' : 'include',
      headers,
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to toggle photo visibility');
    }
    return response.json();
  },

  getToken,
  setToken,
  getUserType,
  setUserType,
  clearAuth,
};

export default api;