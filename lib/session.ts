import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  username: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "a-very-long-and-secure-password-that-is-at-least-32-chars",
  cookieName: "blog-admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getSession();
    return session.isLoggedIn === true;
  } catch {
    return false;
  }
}
