const API_BASE_URL = 'https://api.apithlete.webgeon.com';

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

export interface CheckInOutRequest {
  membershipID: string;
  action: 'checkin' | 'checkout';
}

export interface MembershipDetails {
  status: string;
  membershipID: string;
  plan: string;
  paymentStatus: string;
  expiryDate: string;
  joinDate: string;
}

export interface PersonalInfo {
  age: number;
  gender: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  healthCondition: string;
}

export interface PaymentHistory {
  id: string;
  fullName: string;
  email: string;
  amount: string;
  plan: string;
  paymentDate: string;
  renewalDate: string;
  status: string;
  transactionId: string;
  invoiceNumber: string;
}

export interface TrainerInfo {
  id: string;
  name: string;
  trainerId: string;
  specialization: string;
  experience: string;
  rating: number;
  image: string;
  bio: string;
  phone: string;
  email: string;
  availability: string;
  isAvailable: boolean;
  weeklySchedule: Record<string, string>;
  assignedCustomers: number;
  achievements: string[];
  assignedDate: string;
  nextSession?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  duration: string;
  icon: any;
  color: string;
  popular: boolean;
  savings?: string;
  features: string[];
  perks?: string[];
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
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // OTP Authentication
  async sendOTP(data: SendOTPRequest): Promise<{ message: string; sessionId: string }> {
    return this.request<{ message: string; sessionId: string }>('/api/otp/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/otp/verify-otp', {
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

  // Profile Picture Upload
  async uploadProfilePicture(membershipID: string, imageFile: FormData): Promise<any> {
    const url = `${this.baseURL}/api/member/upload-photo/${membershipID}`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: imageFile,
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Registration
  async registerUser(formData: FormData): Promise<LoginResponse> {
    return fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      body: formData,
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }
      return response.json();
    });
  }

  // Check In/Out
  async checkIn(membershipID: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify({ membershipID, action: 'checkin' }),
    });
  }

  async checkOut(membershipID: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/attendance/checkout', {
      method: 'POST',
      body: JSON.stringify({ membershipID, action: 'checkout' }),
    });
  }

  // Dashboard Data
  async getDashboardData(membershipID: string): Promise<{
    membershipDetails: MembershipDetails;
    personalInfo: PersonalInfo;
    isCheckedIn: boolean;
    checkInTime?: string;
  }> {
    return this.request<{
      membershipDetails: MembershipDetails;
      personalInfo: PersonalInfo;
      isCheckedIn: boolean;
      checkInTime?: string;
    }>(`/api/dashboard/member/${membershipID}`);
  }

  // Payment History
  async getPaymentHistory(membershipID: string): Promise<{ payments: PaymentHistory[] }> {
    return this.request<{ payments: PaymentHistory[] }>(`/api/payment/history/${membershipID}`);
  }

  async downloadInvoice(paymentId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/payment/invoice/${paymentId}`, {
      method: 'GET',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }

    return response.blob();
  }

  // Trainer Information
  async getAssignedTrainer(membershipID: string): Promise<{ trainer: TrainerInfo | null }> {
    return this.request<{ trainer: TrainerInfo | null }>(`/api/member/trainer/${membershipID}`);
  }

  // Membership Plans
  async getMembershipPlans(): Promise<{ plans: MembershipPlan[] }> {
    return this.request<{ plans: MembershipPlan[] }>('/api/membership/plans');
  }

  // Notifications
  async getNotifications(membershipID: string): Promise<{ notifications: any[] }> {
    return this.request<{ notifications: any[] }>(`/api/notifications/${membershipID}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/notifications/read/${notificationId}`, {
      method: 'PUT',
    });
  }
}

export const apiService = new ApiService();
