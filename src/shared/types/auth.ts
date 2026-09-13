export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};

export type SessionUser = {
  username?: string;
  email?: string;
  roles: string[];
  authorities: string[];
  exp?: number;
};
