// Session management for profile-based access control

export type ProfileRole = "zola" | "bru-white";

export type Session = {
  role: ProfileRole;
  name: string;
  email?: string;
};

const SESSION_KEY = "hlumisa_active_session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function isBruWhite(): boolean {
  return getSession()?.role === "bru-white";
}

export function isZola(): boolean {
  return getSession()?.role === "zola";
}