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

export type SessionUser = {
  username?: string;
  roles: string[];
  authorities: string[];
  exp?: number;
};
