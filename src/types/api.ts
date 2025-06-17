export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'employee' | 'enterprise';
}
