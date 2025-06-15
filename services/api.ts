const API_BASE_URL = 'http://api.apithlete.webgeon.com';

export interface SendOTPRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  sessionId: string;
  otp: string;
}

export interface LoginResponse {
  message: string;
  token?: string;
  user?: {
    _id: string;
    email: string;
    full_name: string;
    membershipID: string;
    phone_number: string;
    passport_photo_url?: string;
  };
  newUser?: boolean;
  identifier?: string;
  isEmail?: boolean;
  sessionId?: string;
}

export interface UserProfile {
  _id: string;
  full_name: string;
  email: string;
  phone_number: string;
  age?: number;
  gender?: string;
  health_condition?: string;
  address?: string;
  pincode?: string;
  membershipID: string;
  passport_photo?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  phone_number?: string;
  age?: number;
  gender?: string;
  health_condition?: string;
  address?: string;
  pincode?: string;
  emergency_contact?: string;
}

class ApiService {
  private baseURL = API_BASE_URL;
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log('Making request to:', url);
    console.log('Request options:', { ...options, headers });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // OTP Authentication
  async sendOTP(data: SendOTPRequest): Promise<{ message: string; sessionId: string }> {
    return this.request<{ message: string; sessionId: string }>('/api/otp/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/otp/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Profile
  async getUserProfile(): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>('/api/auth/profile');
  }

  async updateProfile(
    membershipID: string,
    data: UpdateProfileRequest
  ): Promise<{ message: string; member: UserProfile }> {
    return this.request<{ message: string; member: UserProfile }>(
      `/api/member/edit/${membershipID}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  // Registration
  async registerUser(formData: FormData): Promise<LoginResponse> {
    return fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      body: formData, // FormData for file uploads
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return response.json();
    });
  }

  // Dashboard & Stats
  async getDashboardStats(): Promise<any> {
    return this.request<any>('/api/dashboard/stats');
  }

  // Membership Plans
  async getMembershipPlans(): Promise<any> {
    return this.request<any>('/api/membership/plans');
  }

  // Payments
  async getPayments(): Promise<any> {
    return this.request<any>('/api/payment/history');
  }

  // Trainers
  async getTrainers(): Promise<any> {
    return this.request<any>('/api/admin/trainers');
  }

  async addTrainer(data: any): Promise<any> {
    return this.request<any>('/api/admin/trainers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();