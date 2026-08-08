"use client";

import { apiUrl } from "./api";

export type UserInfo = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureBase64?: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResult = {
  token: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureBase64?: string | null;
  expiresAt: string;
};

const TOKEN_KEY = "hlumisa_auth_token";
const USER_KEY = "hlumisa_user";

// ====== Token Management ======

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: UserInfo): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}

// ====== API Calls ======

export async function loginApi(credentials: LoginCredentials): Promise<AuthResult> {
  const response = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Login failed" }));
    throw new Error(error.message || `Login failed (${response.status})`);
  }

  return response.json();
}

export async function fetchMe(token: string): Promise<UserInfo> {
  const response = await fetch(apiUrl("/api/auth/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info (${response.status})`);
  }

  return response.json();
}

export async function updateProfilePictureApi(profilePictureBase64: string): Promise<UserInfo> {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(apiUrl("/api/auth/profile-picture"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ profilePictureBase64 }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to update profile picture" }));
    throw new Error(error.message || `Failed to update profile picture (${response.status})`);
  }

  return response.json();
}