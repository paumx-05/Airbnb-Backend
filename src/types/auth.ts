export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Hasheada
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface UserDB {
  users: User[];
  nextId: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

import { Request } from 'express';

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      createdAt?: string;
    };
    token: string;
  };
  error?: {
    message: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}
