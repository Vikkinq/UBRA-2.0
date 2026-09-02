// frontend/lib/auth.ts
import { cookies } from "next/headers";

export type CareerProfile = {
  id: number;
  user_id: number;
  professional_title: string | null;
  summary: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  facebook_url: string | null;
  photo_url: string | null;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  career_profile: CareerProfile | null;
};

export async function getServerUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_FETCH}/user`, {
    headers: {
      Cookie: cookieStore.toString(),
      Referer: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}
