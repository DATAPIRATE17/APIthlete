const API_BASE_URL = 'https://portal.flexzonegym.com';

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
  emergency_contact?: string;
  identity_type?: string;
  identity_number?: string;
  date_of_birth?: string;
  availability?: string;
  trainer_name?: string;
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
  identity_type?: string;
  identity_number?: string;
  date_of_birth?: string;
  availability?: string;
  trainer_name?: string;
  passport_photo?: string;
  photo_mime_type?: string;
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

export interface Payment {
  id: string;
  full_name: string;
  email: string;
  amount_paid: string;
  membership_plan: string;
  payment_date: string;
  renewal_date: string;
  status: string;
  transactionID: string;
  invoice_number: string;
}

export interface PaymentHistoryResponse {
  payments: Payment[];
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

export interface PaymentInitiationResponse {
  success: boolean;
  checkoutUrl?: string;
  orderId?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: string;
  data: any;
}

export interface PaymentDetails {
  membership_plan: string;
  payment_status: string;
  amount_paid: number;
  payment_date: string;
  renewal_date: string;
  transactionID: string;
  membership_status: string;
}

export interface BarcodeResponse {
  success: boolean;
  barcode: string;
  expiresInMinutes: number;
}

export interface BarcodeVerificationResponse {
  success: boolean;
  message: string;
  member?: any;
  loginTime?: string;
  logoutTime?: string;
  hoursWorked?: number;
}

export interface AttendanceRecord {
  membershipID: string;
  fullName: string;
  date: string;
  loginTime: string;
  logoutTime?: string;
  hoursWorked?: number;
}

export interface IdentityDocumentResponse {
  document: string; // base64 encoded
  mimeType: string;
}

export interface RegistrationFormData {
  full_name: string;
  email: string;
  phone_number: string;
  age: string;
  date_of_birth: string;
  gender: string;
  emergency_contact: string;
  address: string;
  pincode: string;
  availability: string;
  identity_type: string;
  identity_number: string;
  health_condition: string;
  trainer_name?: string;
  passport_photo?: any;
  identity_document?: any;
}

export interface TrainerResponse {
  trainerID: string;
  trainer_name: string;
  specialization: string;
  phone_number: string;
  assigned_Members: number;
  availability: string[];
  passport_photo?: string;
  photo_mime_type?: string;
}

export interface RegistrationResponse {
  message: string;
  token: string;
  user: {
    _id: string;
    email: string;
    full_name: string;
    membershipID: string;
    passport_photo_url?: string;
  };
}

export interface GymInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: {
    contentType: string;
    base64: string;
  };
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

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
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
  ): Promise<{ message: string; user: UserProfile }> {
    return this.request<{ message: string; user: UserProfile }>(
      `/api/auth/edit/${membershipID}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  // Profile Picture Upload
  async uploadProfilePicture(
    membershipID: string,
    imageData: { passport_photo: string; photo_mime_type: string }
  ): Promise<{ message: string; photoUrl: string }> {
    return this.request<{ message: string; photoUrl: string }>(
      `/api/auth/edit/${membershipID}`,
      {
        method: 'PUT',
        body: JSON.stringify(imageData),
      }
    );
  }

  // Registration
  async registerUser(formData: FormData): Promise<LoginResponse> {
    const url = `${this.baseURL}/api/auth/register`;
  
    // Don't set Content-Type header - let the browser set it with the proper boundary
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Check In/Out
  async checkIn(membershipID: string): Promise<{ message: string; attendance: AttendanceRecord }> {
    return this.request<{ message: string; attendance: AttendanceRecord }>(`/api/attendance/checkin/${membershipID}`, {
      method: 'POST',
    });
  }

  async checkOut(membershipID: string): Promise<{ message: string; attendance: AttendanceRecord }> {
    return this.request<{ message: string; attendance: AttendanceRecord }>(`/api/attendance/checkout/${membershipID}`, {
      method: 'POST',
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
  async getPaymentHistory(membershipID: string): Promise<PaymentHistoryResponse> {
    return this.request<PaymentHistoryResponse>(`/api/payment/payment-details/${membershipID}`);
  }

  // Gym Information
  async getGymInfo(): Promise<{ gym: GymInfo }> {
    return this.request<{ gym: GymInfo }>('/api/gym/gym-info');
  }

  // Trainer Information
  async getAssignedTrainer(membershipID: string): Promise<{ trainer: TrainerResponse | null }> {
    return this.request<{ trainer: TrainerResponse | null }>(`/api/admin/trainers/${membershipID}`);
  }

  // Get Trainer Passport Photo
  async getTrainerPassportPhoto(trainerID: string): Promise<{ photo: string }> {
    return this.request<{ photo: string }>(`/api/admin/trainer/passport-photo/${trainerID}`);
  }

  // Get Assigned Members for Trainer
  async getTrainerAssignedMembers(trainerID: string): Promise<{ assigned_members: any[] }> {
    return this.request<{ assigned_members: any[] }>(`/api/trainer/assigned-members/${trainerID}`);
  }

  // Membership Plans
  async getMembershipPlans(): Promise<{ plans: MembershipPlan[] }> {
    return this.request<{ plans: MembershipPlan[] }>('/api/membership/plans');
  }

  // Identity Document
  async getIdentityDocument(membershipID: string): Promise<IdentityDocumentResponse> {
    return this.request<IdentityDocumentResponse>(`/api/member/identity-document/${membershipID}`);
  }

  // OTP-less Login
  async handleOTPlessLogin(data: { email?: string; phone_number?: string }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/handlelogin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Passport Photo
  async getPassportPhoto(membershipID: string): Promise<{ photo: string }> {
    return this.request<{ photo: string }>(`/api/member/passport-photo/${membershipID}`);
  }

  // Get All Trainers
  async getAllTrainers(): Promise<{ trainers: TrainerResponse[] }> {
    return this.request<{ trainers: TrainerResponse[] }>('/api/trainers');
  }

  // Get Trainer by ID
  async getTrainerById(trainerID: string): Promise<{ trainer: TrainerResponse }> {
    return this.request<{ trainer: TrainerResponse }>(`/api/trainers/${trainerID}`);
  }

  // Gym Code Validation (Backend-ready)
  async validateGymCode(code: string): Promise<{ success: boolean; gym?: GymInfo }> {
    return this.request<{ success: boolean; gym?: GymInfo }>('/api/gym/validate-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // QR Code Validation (Backend-ready)
  async validateQRCode(qrData: string): Promise<{ success: boolean; gym?: GymInfo }> {
    return this.request<{ success: boolean; gym?: GymInfo }>('/api/gym/validate-qr', {
      method: 'POST',
      body: JSON.stringify({ qrData }),
    });
  }

  // Get Gym Info by Code (Backend-ready)
  async getGymInfoByCode(code: string): Promise<{ gym: GymInfo }> {
    return this.request<{ gym: GymInfo }>(`/api/gym/info/${code}`);
  }
}

export const apiService = new ApiService();